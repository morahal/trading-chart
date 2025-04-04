'use client';
import { useState, useEffect, useRef } from 'react';

function intervalToSeconds(interval: string) {
  switch (interval) {
    case 'Tick':
      return 1;
    default:
      return 1;
  }
}

interface AggregatedPoint {
  t: number;
  p: number;
}

export default function useBinanceWebsocket(selectedInterval: string) {
  const [data, setData] = useState<AggregatedPoint[]>([]);

  const bufferRef = useRef<{ p: number; t: number }[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = 'wss://fstream.binance.com/ws/btcusdt@aggTrade';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for aggTrade feed');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const price = parseFloat(msg.p);
        const time = msg.E;
        if (!isNaN(price) && typeof time === 'number') {
          bufferRef.current.push({ p: price, t: time });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    const intervalSeconds = intervalToSeconds(selectedInterval);
    const aggregatorInterval = setInterval(() => {
      if (bufferRef.current.length > 0) {
        bufferRef.current.sort((a, b) => a.t - b.t);

        const latestTime = bufferRef.current[bufferRef.current.length - 1].t;

        const avgPrice =
          bufferRef.current.reduce((sum, item) => sum + item.p, 0) /
          bufferRef.current.length;

        setData((prev) => {
          const next = [...prev, { t: latestTime, p: avgPrice }];
          const MAX_POINTS = 200;
          if (next.length > MAX_POINTS) {
            return next.slice(next.length - MAX_POINTS);
          }
          return next;
        });

        bufferRef.current = [];
      }
    }, intervalSeconds * 1000);

    return () => {
      clearInterval(aggregatorInterval);
      wsRef.current?.close();
    };
  }, [selectedInterval]);

  return data;
}
