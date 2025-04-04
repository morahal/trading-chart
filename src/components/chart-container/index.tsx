'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  Chart,
  registerables,
  TimeScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';
import annotationPlugin, {
  LineAnnotationOptions,
} from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import useBinanceWebsocket from '@/hooks/useBinanceWebsocket';
import useHistoricalData from '@/hooks/useHistoricalData';
import ChartHeader from '../chart-header';

ChartJS.register(
  ...registerables,
  annotationPlugin,
  TimeScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
);

export default function ChartContainer() {
  const [selectedInterval, setSelectedInterval] = useState('Tick');
  const liveData = useBinanceWebsocket(selectedInterval);
  const historicalData = useHistoricalData('BTCUSDT');

  const mergedData = [...historicalData, ...liveData].sort((a, b) => a.t - b.t);

  const currentPrice =
    mergedData.length > 0 ? mergedData[mergedData.length - 1].p : 0;
  const highestPrice =
    mergedData.length > 0 ? Math.max(...mergedData.map((d) => d.p)) : 0;
  const lowestPrice =
    mergedData.length > 0 ? Math.min(...mergedData.map((d) => d.p)) : 0;

  const chartRef = useRef<Chart<'line', number[], Date> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom').then((module) => {
        const zoomPlugin = module.default;
        ChartJS.register(zoomPlugin);
      });
    }
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('cryptoChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(247, 147, 26, 0.2)');
    gradient.addColorStop(1, 'rgba(247, 147, 26, 0)');

    const lineAnnotation: LineAnnotationOptions = {
      yMin: 0,
      yMax: 0,
      borderColor: '#4ade80',
      borderDash: [4, 4],
      borderWidth: 1,
      label: {
        display: true,
        content: '0.00',
        position: 'center',
        backgroundColor: '#4ade80',
        color: '#000',
        font: { size: 10, weight: 'bold' },
        padding: 4,
      },
    };

    const newChart = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'BTC Price',
            data: [],
            borderColor: '#f7931a',
            backgroundColor: gradient,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animations: {
          y: { duration: 0 },
          x: { duration: 8000 },
        },
        interaction: { intersect: false },
        scales: {
          x: {
            type: 'time',
            ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 0 },
            border: { display: false },
          },
          y: {
            position: 'right',
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: (value) => {
                const val = typeof value === 'number' ? value : Number(value);
                return val.toFixed(1);
              },
            },
            border: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          annotation: {
            annotations: {
              line1: lineAnnotation,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            displayColors: false,
            backgroundColor: '#1f2937',
            titleColor: '#f7931a',
            bodyColor: '#e5e7eb',
            callbacks: {
              title: ([item]) => {
                const t = item.parsed.x as number;
                return new Date(t).toLocaleString();
              },
              label: (ctx) => {
                const y = ctx.parsed.y as number;
                return `$${y.toFixed(2)}`;
              },
            },
          },
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
              onZoomComplete: ({ chart }) => {
                chart.update();
              },
            },
          },
        },
      },
    });

    chartRef.current = newChart;
    return () => {
      newChart.destroy();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    chart.data.labels = [];
    chart.data.datasets[0].data = [];

    mergedData.forEach((point) => {
      chart.data.labels?.push(new Date(point.t));
      chart.data.datasets[0].data.push(point.p);
    });

    if (mergedData.length > 0) {
      const latest = mergedData[mergedData.length - 1].p;
      const annos = chart.options.plugins?.annotation?.annotations;
      if (annos && 'line1' in annos) {
        const line1 = annos.line1 as LineAnnotationOptions;
        line1.yMin = latest;
        line1.yMax = latest;
        line1.label!.content = latest.toFixed(2);
        if (mergedData.length > 1) {
          const prevPrice = mergedData[mergedData.length - 2].p;
          if (latest < prevPrice) {
            line1.borderColor = '#F44336';
            line1.label!.backgroundColor = '#F44336';
          } else {
            line1.borderColor = '#4ade80';
            line1.label!.backgroundColor = '#4ade80';
          }
        }
      }
    }

    chart.data.datasets[0].pointRadius = mergedData.map((_, i) =>
      i === mergedData.length - 1 ? 4 : 0,
    ) as unknown as number[];

    chart.data.datasets[0].pointBackgroundColor = mergedData.map((_, i) =>
      i === mergedData.length - 1 ? '#42A5F5' : 'transparent',
    ) as unknown as string[];

    chart.data.datasets[0].pointBorderColor = mergedData.map((_, i) =>
      i === mergedData.length - 1 ? '#42A5F5' : 'transparent',
    ) as unknown as string[];

    chart.update();
  }, [mergedData]);

  const resetZoomHandler = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div className="w-full bg-[#131722] text-white">
      <ChartHeader
        currentPrice={currentPrice}
        highestPrice={highestPrice}
        lowestPrice={lowestPrice}
        resetZoomHandler={resetZoomHandler}
      />
      <div className="relative w-full h-[500px]">
        <canvas id="cryptoChart" className="w-full h-full" />
      </div>
    </div>
  );
}
