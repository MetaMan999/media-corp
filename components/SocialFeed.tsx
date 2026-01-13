
import React, { useState } from 'react';
import { TweetItem } from '../types';

interface SocialFeedProps {
  tweets: TweetItem[];
  loading: boolean;
  onSearch: (query: string) => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ tweets, loading, onSearch, autoRefresh, onToggleAutoRefresh }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search & Control Bar */}
      <div className="bg-zinc-950 border border-zinc-900 p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <form onSubmit={handleSubmit} className="relative flex-1 flex items-center">
            <span className="absolute left-3 text-red-600 font-black text-xs">&gt;</span>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SCAN_SOCIAL_SIGNALS (e.g. 'Bitcoin ETF', 'PEPE Sentiment')"
              className="w-full bg-zinc-900/50 border border-zinc-800 py-3 pl-8 pr-4 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors uppercase font-mono"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'SCANNING...' : 'SCAN_NETWORK'}
            </button>
          </form>

          <div className="flex items-center gap-4 bg-zinc-900/30 px-3 py-2 border border-zinc-800/50">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Auto_Refresh</span>
              <span className={`text-[9px] font-black uppercase ${autoRefresh ? 'text-red-500' : 'text-zinc-700'}`}>
                {autoRefresh ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <button 
              onClick={onToggleAutoRefresh}
              className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${autoRefresh ? 'bg-red-600/40' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${autoRefresh ? 'right-1 bg-red-600' : 'left-1 bg-zinc-600'}`}></div>
            </button>
          </div>
        </div>

        <div className="flex justify-between px-1">
          <div className="flex items-center gap-3">
            <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Protocol: X_GROUNDING_NODE_v3</span>
            {autoRefresh && !loading && (
              <span className="text-[8px] text-red-900 font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                <span className="w-1 h-1 bg-red-900 rounded-full"></span>
                Periodic_Sweep_Armed
              </span>
            )}
          </div>
          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Status: Ready</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse border border-zinc-900 p-6 rounded-sm">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-10 h-10 bg-zinc-900 rounded-full"></div>
                <div className="h-4 w-32 bg-zinc-900"></div>
              </div>
              <div className="h-4 w-full bg-zinc-900 mb-2"></div>
              <div className="h-4 w-2/3 bg-zinc-900"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="group bg-zinc-950/40 border border-zinc-900 p-6 hover:border-red-600/50 transition-all duration-300 relative overflow-hidden">
               {/* Decorative scan line */}
               <div className="absolute top-0 left-0 w-full h-px bg-red-600/20 group-hover:bg-red-600/50 group-hover:h-[2px] transition-all"></div>
               
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center text-xs font-black text-red-500 overflow-hidden ring-1 ring-zinc-700">
                    <img src={`https://picsum.photos/seed/${tweet.handle}/40/40`} alt="" className="grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-none mb-1">
                      {tweet.user}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {tweet.handle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                     tweet.sentiment === 'BULLISH' ? 'bg-green-600/10 text-green-500 border border-green-500/20' :
                     tweet.sentiment === 'BEARISH' ? 'bg-red-600/10 text-red-500 border border-red-500/20' :
                     'bg-zinc-800 text-zinc-400'
                   }`}>
                     {tweet.sentiment}
                   </span>
                   <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                   <span className="text-[9px] font-mono text-zinc-600">INT_ID: {tweet.id.slice(-4)}</span>
                </div>
              </div>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-medium">
                {tweet.content}
              </p>
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-zinc-600 group-hover:text-red-500 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-[10px] font-bold">REPLY_NODE</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 group-hover:text-green-500 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-[10px] font-bold">SIGNAL_VAL</span>
                </div>
              </div>
            </div>
          ))}
          {tweets.length === 0 && !loading && (
            <div className="text-center py-20 border border-dashed border-zinc-800">
              <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">No social signals detected for current search parameters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
