'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export interface CandleData {
  t: number;
  open: number;
  high: number;
  low: number;
  p: number;
  volume: number;
}

function useHistoricalData(symbol: string) {
  const [historicalData, setHistoricalData] = useState<CandleData[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      const response = await axios.get(
        'https://api.binance.com/api/v3/klines',
        {
          params: {
            symbol,
            interval: '1m',
            limit: 1440,
          },
        },
      );
      const parsed = response.data.map((candle: any) => {
        return {
          t: candle[0],
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          p: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        };
      });
      setHistoricalData(parsed);
    }
    fetchHistory();
  }, [symbol]);

  return historicalData;
}

export default useHistoricalData;
