'use client';

import React from 'react';
import { FaBitcoin } from 'react-icons/fa';

interface ChartHeaderProps {
  currentPrice: number;
  highestPrice: number;
  lowestPrice: number;
  resetZoomHandler: () => void;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  currentPrice,
  highestPrice,
  lowestPrice,
  resetZoomHandler,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#f7931a] flex items-center justify-center">
          <FaBitcoin size={24} />
        </div>

        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-green-400">
            {currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="ml-1">
          <div className="text-sm font-medium flex items-center">
            <span className="font-bold">BTC · Bitcoin</span>
          </div>

          <div className="text-xs text-gray-400 font-bold">
            24h Vol: 356M ·{' '}
            <span className="text-green-400">
              H:{' '}
              {highestPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>{' '}
            ·{' '}
            <span className="text-red-400">
              L:{' '}
              {lowestPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="ml-4 flex space-x-2">
        <button
          onClick={resetZoomHandler}
          className="text-gray-300 hover:text-white text-sm border border-gray-600 rounded px-2 py-1 cursor-pointer"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
};

export default ChartHeader;
