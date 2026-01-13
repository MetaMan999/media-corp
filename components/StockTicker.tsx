
import React from 'react';
import { MarketData } from '../types';

interface StockTickerProps {
  data: MarketData[];
  loading: boolean;
}

const StockTicker: React.FC<StockTickerProps> = ({ data, loading }) => {
  const displayData = data.length > 0 ? data : [
    { symbol: "SYNCING NODE...", price: "---", change: "---", isPositive: true }
  ];

  return (
    <div className="bg-black border-y border-red-600/50 overflow-hidden py-1.5 relative">
      {loading && (
        <div className="absolute inset-0 bg-red-600/5 z-10 animate-pulse pointer-events-none"></div>
      )}
      <div className="animate-marquee whitespace-nowrap">
        {[...displayData, ...displayData].map((item, idx) => (
          <div key={idx} className="inline-flex items-center mx-8 text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">
            <span className="text-zinc-600 mr-2 flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full ${loading ? 'bg-zinc-800' : 'bg-red-500'}`}></span>
              {item.symbol}
            </span>
            <span className="text-white mr-3 tabular-nums">{item.price}</span>
            <span className={`flex items-center gap-1 font-bold ${item.isPositive ? "text-green-500" : "text-red-500"}`}>
              {item.isPositive ? "▲" : "▼"} {item.change}
            </span>
            {item.lastUpdated && (
              <span className="ml-2 text-[8px] text-zinc-800 tabular-nums">@{item.lastUpdated}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;
