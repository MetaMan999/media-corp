
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { createIntelligenceChat } from '../services/geminiService';
import { GenerateContentResponse } from "@google/genai";

interface ChatMessageWithSources extends ChatMessage {
  sources?: { title: string, uri: string }[];
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageWithSources[]>([
    { 
      role: 'model', 
      text: 'METAMEDIA INTELLIGENCE UPLINK ESTABLISHED. ALL LIVE NODES SYNCED. READY FOR COMMAND INPUT.', 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRunningFunction, setIsRunningFunction] = useState(false);
  const chatInstance = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isRunningFunction]);

  const executeSmartFunction = async (name: string, args: any) => {
    console.debug(`Executing ${name}`, args);
    // Simulate real-time API intercepts
    if (name === 'get_market_indicators') {
      const metrics: any = {
        SENTIMENT: { value: 72, label: 'Greed', trend: 'Up' },
        DOMINANCE: { value: '55.1%', asset: 'BTC', trend: 'Rising' },
        VOLUME: { value: '$112B', window: '24h', change: '+8%' }
      };
      return metrics[args.metric] || { error: 'Node busy' };
    }
    if (name === 'get_network_metrics') {
      const network: any = {
        GAS: { base: '22 gwei', priority: 'High', status: 'Moderate' },
        WHALES: { recent: '3 transfers > 10k BTC detected', destination: 'Cold Wallet', risk: 'Low' },
        LIQUIDATIONS: { total: '$142M', side: 'Shorts', ratio: '68%' }
      };
      return network[args.metricType] || { error: 'Signal lost' };
    }
    return { error: 'Unknown tool' };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessageWithSources = { 
      role: 'user', 
      text: input.toUpperCase(), 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      if (!chatInstance.current) chatInstance.current = createIntelligenceChat();

      let response: GenerateContentResponse = await chatInstance.current.sendMessage({ message: currentInput });
      
      let functionCalls = response.functionCalls;
      while (functionCalls && functionCalls.length > 0) {
        setIsRunningFunction(true);
        const functionResponses = [];
        for (const fc of functionCalls) {
          const result = await executeSmartFunction(fc.name, fc.args);
          functionResponses.push({
            functionResponse: { name: fc.name, id: fc.id, response: { result } }
          });
        }
        response = await chatInstance.current.sendMessage({ message: functionResponses });
        functionCalls = response.functionCalls;
        setIsRunningFunction(false);
      }

      const botText = response.text || "COMM_LINK_ERROR";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        title: chunk.web?.title || 'Grounding Point',
        uri: chunk.web?.uri || '#'
      })).filter(s => s.uri !== '#') || [];
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: botText, 
        timestamp: new Date().toLocaleTimeString(),
        sources: sources.length > 0 ? sources : undefined
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "NEURAL_LINK_ERROR: RE-SYNC REQUIRED.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    } finally {
      setIsTyping(false);
      setIsRunningFunction(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-mono">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-4 px-6 py-4 bg-zinc-950 border-2 transition-all duration-700 ${
          isOpen ? 'border-zinc-800 text-zinc-500' : 'border-red-600 text-red-500 shadow-[0_0_30px_rgba(255,0,0,0.15)] hover:bg-red-600 hover:text-white'
        }`}
      >
        <div className="relative">
          <span className={`w-2 h-2 rounded-full bg-red-600 block ${isOpen ? '' : 'animate-ping'}`}></span>
          <span className="absolute inset-0 w-2 h-2 rounded-full bg-red-600 opacity-50"></span>
        </div>
        <span className="text-[11px] font-black tracking-[0.3em] uppercase">
          {isOpen ? 'EXIT_INTERFACE' : 'INTEL_NODE_v3.5'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] md:w-[500px] h-[600px] bg-zinc-950 border-2 border-zinc-800 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="p-5 border-b border-zinc-800 bg-black flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-red-600 tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600"></span>
                Terminal_Uplink_Alpha
              </span>
              <span className="text-[8px] text-zinc-600 font-bold mt-1">PROTO: SECURE // CRYPTO_INTEL: LIVE</span>
            </div>
            <div className="flex gap-1.5">
              <div className={`w-3 h-3 ${isRunningFunction ? 'bg-red-600 animate-pulse' : 'bg-zinc-900'}`}></div>
              <div className="w-3 h-3 bg-zinc-900"></div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{msg.role} | {msg.timestamp}</span>
                </div>
                <div className={`max-w-[90%] px-4 py-3 text-xs leading-relaxed font-bold tracking-wide ${
                  msg.role === 'user' 
                    ? 'bg-red-600/10 text-red-500 border-r-4 border-red-600' 
                    : 'bg-zinc-900/60 text-zinc-300 border-l-4 border-zinc-800'
                }`}>
                  {msg.text}
                  {msg.sources && (
                    <div className="mt-4 pt-3 border-t border-zinc-800/50">
                      <p className="text-[8px] font-black text-zinc-700 mb-2 uppercase">Verified_Grounding_Points:</p>
                      <div className="flex flex-wrap gap-3">
                        {msg.sources.map((src, idx) => (
                          <a key={idx} href={src.uri} target="_blank" rel="noopener" className="text-[9px] text-red-600/70 hover:text-red-500 underline decoration-zinc-800 truncate max-w-[140px]">
                            {src.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isRunningFunction && (
              <div className="flex flex-col items-start gap-3">
                <span className="text-[9px] text-red-600 font-black animate-pulse uppercase tracking-widest">[INTERCEPTING_BLOCKCHAIN_SIGNAL...]</span>
                <div className="w-48 h-1 bg-zinc-900 overflow-hidden">
                  <div className="w-1/2 h-full bg-red-600 animate-slide-infinite"></div>
                </div>
              </div>
            )}
            {isTyping && !isRunningFunction && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-700 font-black">NODE_ANALYZING...</span>
                <span className="w-1 h-1 bg-red-600 animate-ping"></span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-5 border-t border-zinc-800 bg-black">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-red-600 text-xs font-black select-none">#</span>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ENTER SEARCH QUERY OR CMD..."
                disabled={isTyping}
                className="w-full bg-zinc-900/40 border border-zinc-800 py-4 pl-10 pr-4 text-xs text-white placeholder:text-zinc-800 focus:outline-none focus:border-red-600/40 transition-all uppercase disabled:opacity-30"
              />
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slide-infinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-slide-infinite {
          animation: slide-infinite 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
