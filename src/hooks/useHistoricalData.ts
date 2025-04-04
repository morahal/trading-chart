import { useState, useEffect } from 'react';
import axios from 'axios';

function useHistoricalData(symbol: string) {
  const [historicalData, setHistoricalData] = useState([]);

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
          p: parseFloat(candle[4]),
        };
      });
      setHistoricalData(parsed);
    }
    fetchHistory();
  }, [symbol]);

  return historicalData;
}

export default useHistoricalData;
