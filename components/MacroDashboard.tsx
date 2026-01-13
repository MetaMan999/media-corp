
import React from 'react';
import { MacroNode } from '../types';

interface MacroDashboardProps {
  data: MacroNode[];
  loading: boolean;
}

const MacroDashboard: React.FC<MacroDashboardProps> = ({ data, loading }) => {
  const groups = ['CRYPTO_MACRO', 'EQUITIES', 'COMMODITIES', 'INDICATORS'];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-500';
      case 'HIGH': return 'bg-orange-600/20 text-orange-500 border-orange-500/30';
      case 'MODERATE': return 'bg-blue-600/20 text-blue-500 border-blue-500/30';
      case 'LOW': return 'bg-zinc-800 text-zinc-500 border-zinc-700';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {groups.map(group => {
        const items = data.filter(d => d.group === group);
        if (items.length === 0 && !loading) return null;

        return (
          <div key={group} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <span className="w-4 h-px bg-red-600"></span>
                <h3 className="text-[11px] font-black text-white tracking-[0.5em] uppercase">{group.replace('_', ' ')}</h3>
              </div>
              <span className="text-[8px] font-mono text-zinc-800 tracking-tighter">DOMAIN_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 animate-pulse relative h-48">
                    <div className="h-3 w-20 bg-zinc-900 mb-6"></div>
                    <div className="h-10 w-full bg-zinc-800 mb-4"></div>
                    <div className="h-12 w-full bg-zinc-900"></div>
                  </div>
                ))
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="bg-zinc-950/60 border border-zinc-900 p-6 group hover:border-red-600/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-full">
                    {/* Signal Pulse */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`w-1 h-1 rounded-full ${item.isPositive ? 'bg-green-500' : 'bg-red-500'} animate-ping opacity-75`}></span>
                      <span className={`w-1 h-1 rounded-full ${item.isPositive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{item.label}</h4>
                          <span className={`inline-block px-1.5 py-0.5 text-[7px] font-black border rounded-sm tracking-tighter ${getImpactColor(item.impact)}`}>
                            {item.impact}_IMPACT
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none">{item.value}</span>
                        <span className={`text-[10px] font-black ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {item.isPositive ? '▲' : '▼'} {item.change}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900/50">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">
                        <span className="text-red-600/70 mr-2">INTEL:</span>
                        {item.context}
                      </p>
                    </div>

                    {/* Scanning Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {!loading && data.length === 0 && (
        <div className="py-24 text-center border border-dashed border-zinc-900 bg-zinc-950/20">
          <p className="text-red-900 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Critical Error: Intelligence Domain Lost. Check Uplink.</p>
        </div>
      )}
    </div>
  );
};

export default MacroDashboard;
