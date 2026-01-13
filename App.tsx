
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, NewsItem, EventItem, TweetItem, MarketData, NodeStatus, MacroNode } from './types';
import { fetchBreakingNews, fetchGlobalEvents, fetchSocialFeed, fetchLiveMarketTicker, fetchMacroData } from './services/geminiService';
import StockTicker from './components/StockTicker';
import NewsCard from './components/NewsCard';
import EventMonitor from './components/EventMonitor';
import SocialFeed from './components/SocialFeed';
import ChatBot from './components/ChatBot';
import MacroDashboard from './components/MacroDashboard';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.MARKETS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tweets, setTweets] = useState<TweetItem[]>([]);
  const [tickerData, setTickerData] = useState<MarketData[]>([]);
  const [macroData, setMacroData] = useState<MacroNode[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('NEVER');
  const [autoRefreshSocial, setAutoRefreshSocial] = useState<boolean>(true);
  
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [loadingTicker, setLoadingTicker] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const tickerInterval = useRef<any>(null);
  const socialRefreshInterval = useRef<any>(null);
  const categoryTimer = useRef<any>(null);

  const nodes: NodeStatus[] = [
    { id: 'node_alpha', label: 'GROUNDING_NODE', status: loadingContent ? 'SYNCING' : 'ACTIVE', integrity: '98.2%' },
    { id: 'node_beta', label: 'MARKET_DATA_L1', status: loadingTicker ? 'SYNCING' : 'ACTIVE', integrity: '99.9%' },
    { id: 'node_gamma', label: 'SOCIAL_INTERCEPT', status: (activeCategory === Category.SOCIAL && loadingContent) ? 'SYNCING' : 'ACTIVE', integrity: '94.5%' },
  ];

  const loadTicker = useCallback(async () => {
    setLoadingTicker(true);
    try {
      const data = await fetchLiveMarketTicker();
      if (data.length > 0) setTickerData(data);
    } catch (err) {
      console.warn("Ticker node currently busy.");
    } finally {
      setLoadingTicker(false);
    }
  }, []);

  const loadData = useCallback(async (category: Category, query?: string) => {
    setLoadingContent(true);
    setError(null);
    try {
      if (category === Category.SOCIAL) {
        const socialData = await fetchSocialFeed(query);
        setTweets(socialData.tweets);
      } else if (category === Category.MACRO) {
        const data = await fetchMacroData();
        setMacroData(data);
      } else {
        const newsData = await fetchBreakingNews(category);
        setNews(newsData.news);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error("LoadData failed:", err);
      const errStr = JSON.stringify(err).toUpperCase();
      if (errStr.includes('429') || errStr.includes('QUOTA') || errStr.includes('EXHAUSTED')) {
        setError("NODE_COOLING_DOWN: RETRY_IN_60S");
      } else {
        setError("UPLINK_FAILURE: PACKET_LOSS");
      }
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const eventData = await fetchGlobalEvents();
      setEvents(eventData.events);
    } catch (err) {
      console.warn("Event monitor currently busy.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  // Staggered initialization
  useEffect(() => {
    const initSequence = async () => {
      // Step 1: Market Ticker
      await loadTicker();
      
      // Step 2: Global Events (Wait 10s)
      setTimeout(() => {
        loadEvents();
      }, 10000);

      // Relaxed Ticker Refresh: 3 Minutes
      tickerInterval.current = setInterval(loadTicker, 180000);
    };

    initSequence();
    
    return () => clearInterval(tickerInterval.current);
  }, [loadTicker, loadEvents]);

  // Handle Social Auto Refresh: Relaxed to 2.5 Minutes
  useEffect(() => {
    if (socialRefreshInterval.current) clearInterval(socialRefreshInterval.current);
    
    if (activeCategory === Category.SOCIAL && autoRefreshSocial && !loadingContent) {
      socialRefreshInterval.current = setInterval(() => {
        loadData(Category.SOCIAL);
      }, 150000); 
    }

    return () => {
      if (socialRefreshInterval.current) clearInterval(socialRefreshInterval.current);
    };
  }, [activeCategory, autoRefreshSocial, loadData, loadingContent]);

  // Debounced Category Switch: 1s debounce to avoid rapid clicks
  useEffect(() => {
    if (categoryTimer.current) clearTimeout(categoryTimer.current);
    categoryTimer.current = setTimeout(() => {
      loadData(activeCategory);
    }, 1000);
    
    return () => clearTimeout(categoryTimer.current);
  }, [activeCategory, loadData]);

  const handleManualResync = () => {
    loadData(activeCategory);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-red-600 font-sans">
      <StockTicker data={tickerData} loading={loadingTicker} />

      <header className="py-16 md:py-24 border-b border-red-600 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #ff0000 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
        <div className="text-center z-10 px-4">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border border-red-600/30 bg-red-600/5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[9px] font-black text-red-500 tracking-[0.3em] uppercase">Intelligence Terminal Live</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase flex flex-col md:flex-row justify-center items-center leading-none">
            <span className="text-white">METAMEDIA</span>
            <span className="text-red-600">CORP</span>
          </h1>
          <p className="text-zinc-600 mt-6 text-xs font-black tracking-[0.5em] uppercase">Digital Asset Risk Control Unit</p>
        </div>
      </header>

      <nav className="bg-black sticky top-0 z-50 border-b border-zinc-900 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex justify-center md:justify-start gap-8 py-6 overflow-x-auto no-scrollbar">
            {Object.values(Category).map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                    activeCategory === cat ? "text-red-500" : "text-zinc-600 hover:text-white"
                  }`}
                >
                  {cat === activeCategory && <span className="w-1 h-3 bg-red-600"></span>}
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div className="flex flex-col">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                  {activeCategory === Category.MACRO ? "Macro_Economic_Domain" : "Live_Intercept_Feed"}
                </h2>
                <div className="text-[9px] text-zinc-700 font-mono mt-1">LAST_SIGNAL_STEEP: {lastSyncTime}</div>
              </div>
              
              <button 
                onClick={handleManualResync}
                disabled={loadingContent}
                className={`group flex items-center gap-3 px-4 py-2 border transition-all duration-300 font-mono text-[10px] font-black uppercase tracking-widest ${
                  loadingContent 
                    ? 'border-zinc-800 text-zinc-700 cursor-not-allowed' 
                    : 'border-red-600/40 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]'
                }`}
              >
                <svg className={`w-3 h-3 ${loadingContent ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loadingContent ? 'SYNCING...' : 'RESYNC_NODE'}
              </button>
            </div>

            {error && (
              <div className="bg-red-900/10 border border-red-900/40 p-6 mb-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 h-1 bg-red-600 animate-pulse w-full"></div>
                 <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">{error}</p>
                 <button 
                  onClick={handleManualResync} 
                  className="mt-4 text-[9px] underline text-zinc-500 hover:text-white uppercase font-bold"
                 >
                  Manual_Override_Retry
                 </button>
              </div>
            )}

            {loadingContent ? (
              <div className="space-y-16">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="h-4 w-20 bg-zinc-900"></div>
                    <div className="h-10 w-full bg-zinc-800"></div>
                    <div className="h-24 w-full bg-zinc-900"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {activeCategory === Category.SOCIAL ? (
                  <SocialFeed 
                    tweets={tweets} 
                    loading={loadingContent} 
                    onSearch={(q) => loadData(Category.SOCIAL, q)} 
                    autoRefresh={autoRefreshSocial}
                    onToggleAutoRefresh={() => setAutoRefreshSocial(!autoRefreshSocial)}
                  />
                ) : activeCategory === Category.MACRO ? (
                  <MacroDashboard data={macroData} loading={loadingContent} />
                ) : (
                  news.map((item) => <NewsCard key={item.id} news={item} />)
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="bg-zinc-950/30 border border-zinc-900 p-6 font-mono">
               <h3 className="text-[10px] font-black text-red-600 uppercase mb-6 tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-600"></span>
                 Node_Status_Monitor
               </h3>
               <div className="space-y-5">
                  {nodes.map(node => (
                    <div key={node.id} className="group">
                      <div className="flex justify-between items-center text-[10px] mb-2">
                        <span className="text-zinc-500 font-bold tracking-wider">{node.label}</span>
                        <span className={`px-1.5 py-0.5 font-black ${
                          node.status === 'ACTIVE' ? 'text-green-500 bg-green-500/5' : 'text-orange-500 bg-orange-500/5 animate-pulse'
                        }`}>{node.status}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${node.status === 'ACTIVE' ? 'bg-zinc-700 w-full' : 'bg-red-600 w-1/3'}`}></div>
                      </div>
                      <div className="mt-1 text-right text-[8px] text-zinc-800 tracking-tighter">INTEGRITY_CHECK: {node.integrity}</div>
                    </div>
                  ))}
               </div>
            </div>

            <EventMonitor events={events} loading={loadingEvents} />
            
            <div className="border border-zinc-900 p-6 bg-zinc-950/20">
               <div className="flex items-center gap-3 text-red-600 mb-4">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <span className="text-[11px] font-black uppercase tracking-widest">Global Risk Warning</span>
               </div>
               <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed tracking-wider">
                 All data intercepted via Metamedia Node-Array is provided as-is. High volatility alerts are currently: <span className="text-red-500">TRIGGERED</span>.
               </p>
            </div>
          </div>
        </div>
      </main>

      <ChatBot />

      <footer className="bg-zinc-950 border-t border-zinc-900 py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <h2 className="text-2xl font-black italic mb-4 tracking-tighter">METAMEDIA <span className="text-red-600">CORP</span></h2>
            <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.4em]">Proprietary Intelligence Core v3.5.2</p>
          </div>
          <div className="text-right md:max-w-xl">
            <p className="text-zinc-800 text-[9px] uppercase font-bold tracking-[0.2em] leading-loose">
              Automated ground-truth verification enabled. Neural link protocols maintained via secure downlink. METAMEDIA CORP does not provide investment advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
