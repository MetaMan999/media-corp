
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { NewsItem, Category, EventItem, TweetItem, MarketData, MacroNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Utility for exponential backoff retries on rate limits (429)
 * Increased retries and initial delay for more stability on free tier.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 4000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toUpperCase();
    const isRateLimit = error?.status === 429 || 
                       error?.message?.includes('429') || 
                       error?.message?.includes('quota') || 
                       errorStr.includes('RESOURCE_EXHAUSTED') ||
                       errorStr.includes('429');
                       
    if (retries > 0 && isRateLimit) {
      console.warn(`METAMEDIA_CORE: Uplink congested (429). Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Increase delay significantly on each retry to respect backoff
      return withRetry(fn, retries - 1, delay * 2.5);
    }
    throw error;
  }
}

export const networkMetricsFunctionDeclaration: FunctionDeclaration = {
  name: 'get_network_metrics',
  parameters: {
    type: Type.OBJECT,
    description: 'Fetch real-time blockchain network metrics like GAS, WHALE_ALERTS, or LIQUIDATIONS.',
    properties: {
      metricType: {
        type: Type.STRING,
        description: 'The type of data: "GAS", "WHALES", "LIQUIDATIONS".',
      }
    },
    required: ['metricType'],
  },
};

export const marketIndicatorsFunctionDeclaration: FunctionDeclaration = {
  name: 'get_market_indicators',
  parameters: {
    type: Type.OBJECT,
    description: 'Fetch global market sentiment and dominance indicators.',
    properties: {
      metric: {
        type: Type.STRING,
        description: 'Fetch: "SENTIMENT", "DOMINANCE", or "VOLUME".',
      }
    },
    required: ['metric'],
  },
};

export const createIntelligenceChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      tools: [
        { googleSearch: {} }, 
        { functionDeclarations: [marketIndicatorsFunctionDeclaration, networkMetricsFunctionDeclaration] }
      ],
      systemInstruction: `You are the METAMEDIA CORP Senior Intelligence Analyst. 
      You have access to Google Search and proprietary network tools.
      Current Node Capabilities:
      - 'get_network_metrics': High-signal blockchain data (Gas, Whale moves).
      - 'get_market_indicators': Macro sentiment.
      Always emphasize data integrity and provide timestamps if possible.`,
      temperature: 0.7,
    },
  });
};

export const fetchLiveMarketTicker = async (): Promise<MarketData[]> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Get the current real-time prices and 24h percentage change for BTC, ETH, SOL, BNB, XRP, DOGE, PEPE, and LINK. Return in a list format.",
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "Format output as: 'SYMBOL:PRICE:CHANGE:DIRECTION(UP/DOWN)'. Be precise.",
        },
      });

      const text = response.text || "";
      const lines = text.split('\n').filter(l => l.includes(':'));
      
      return lines.map(line => {
        const [symbol, price, change, direction] = line.split(':').map(s => s.trim());
        return {
          symbol: symbol || "ERR",
          price: price || "$0.00",
          change: change || "0%",
          isPositive: direction?.toUpperCase() === 'UP',
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }).filter(m => m.symbol !== "ERR");
    } catch (error) {
      console.error("Ticker node failed:", error);
      throw error; // Rethrow so withRetry can handle it
    }
  });
};

export const fetchMacroData = async (): Promise<MacroNode[]> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Search for current real-time values of: S&P 500, Nasdaq 100, FTSE 100, Nikkei 225, DXY Index, US 10Y Bond Yield, Gold, Silver, Crude Oil, BTC Dominance, Total Crypto Market Cap, and US Fed Interest Rate. Assess their current impact on the digital asset ecosystem.",
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "Format strictly as: 'GROUP:LABEL:VALUE:CHANGE:DIRECTION(UP/DOWN):IMPACT(CRITICAL/HIGH/MODERATE/LOW):CONTEXT'. Groups must be EQUITIES, COMMODITIES, INDICATORS, or CRYPTO_MACRO.",
        },
      });

      const text = response.text || "";
      const lines = text.split('\n').filter(l => l.includes(':'));

      return lines.map(line => {
        const [group, label, value, change, direction, impact, context] = line.split(':').map(s => s.trim());
        return {
          group: (group as any) || 'INDICATORS',
          label: label || 'UNKNOWN',
          value: value || 'N/A',
          change: change || '0%',
          isPositive: direction?.toUpperCase() === 'UP',
          impact: (impact as any) || 'LOW',
          context: context || 'Intelligence signal pending...'
        };
      }).filter(node => node.label !== 'UNKNOWN');
    } catch (error) {
      console.error("Macro sync failed:", error);
      throw error;
    }
  });
};

export const fetchBreakingNews = async (category: Category): Promise<{ news: NewsItem[], sources: { title: string, uri: string }[] }> => {
  return withRetry(async () => {
    const categoryContext = {
      [Category.MARKETS]: "Global cryptocurrency markets and institutional Bitcoin/Ethereum ETFs.",
      [Category.MACRO]: "Global macroeconomic trends, inflation, central bank policies, and trad-fi indices.",
      [Category.DEFI]: "Decentralized Finance protocols and DEX volume trends.",
      [Category.ALTCOINS]: "Emerging layer-1/layer-2 blockchains and AI-centric digital assets.",
      [Category.REGULATION]: "Global crypto legislation and enforcement actions.",
      [Category.POLITICS]: "Geopolitical shifts affecting finance.",
      [Category.SOCIAL]: "Social media sentiment trends."
    };
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for 5 major breaking news stories from the last 24 hours regarding: ${categoryContext[category]}.`,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "Return: 'TITLE:', 'SUMMARY:', 'CATEGORY:'. Use high-density intelligence style.",
        },
      });

      const text = response.text || "";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      })).filter(s => s.uri !== '#') || [];

      const parts = text.split(/TITLE:/i).filter(p => p.trim());
      return {
        news: parts.map((part, index) => {
          const titleLine = part.split(/SUMMARY:/i)[0]?.trim();
          const rest = part.split(/SUMMARY:/i)[1] || "";
          const summaryLine = rest.split(/CATEGORY:/i)[0]?.trim();
          return {
            id: `n-${index}-${Date.now()}`,
            title: titleLine || "Intelligence Update",
            summary: summaryLine || "Data corrupted.",
            category: category,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }),
        sources
      };
    } catch (error) {
      console.error("Breaking news fetch failed:", error);
      throw error;
    }
  });
};

export const fetchSocialFeed = async (query?: string): Promise<{ tweets: TweetItem[], sources: { title: string, uri: string }[] }> => {
  return withRetry(async () => {
    const searchQuery = query 
      ? `Search X (Twitter) for recent viral posts regarding: ${query}.`
      : "Search for the latest viral crypto social media posts from the last 12 hours.";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: searchQuery,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "Format: 'USER:', 'HANDLE:', 'CONTENT:', 'SENTIMENT:' (BULLISH/BEARISH/NEUTRAL).",
        },
      });

      const text = response.text || "";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      })).filter(s => s.uri !== '#') || [];

      const parts = text.split(/USER:/i).filter(p => p.trim());
      return {
        tweets: parts.map((part, index) => {
          const userLine = part.split(/HANDLE:/i)[0]?.trim();
          const rest = part.split(/HANDLE:/i)[1] || "";
          const handleLine = rest.split(/CONTENT:/i)[0]?.trim();
          const rest2 = rest.split(/CONTENT:/i)[1] || "";
          const contentLine = rest2.split(/SENTIMENT:/i)[0]?.trim();
          const sentimentLine = rest2.split(/SENTIMENT:/i)[1]?.trim() as any;
          return {
            id: `t-${index}`,
            user: userLine || "Unknown",
            handle: handleLine || "@anon",
            content: contentLine || "...",
            sentiment: ['BULLISH', 'BEARISH', 'NEUTRAL'].includes(sentimentLine) ? sentimentLine : 'NEUTRAL',
            timestamp: "LIVE"
          };
        }),
        sources
      };
    } catch (error) {
      console.error("Social feed fetch failed:", error);
      throw error;
    }
  });
};

export const fetchGlobalEvents = async (): Promise<{ events: EventItem[], sources: { title: string, uri: string }[] }> => {
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Search for 5 high-impact upcoming crypto events this week.",
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "Format: 'EVENT:', 'DATE:', 'STATUS:', 'INFO:'.",
        },
      });

      const text = response.text || "";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      })).filter(s => s.uri !== '#') || [];

      const parts = text.split(/EVENT:/i).filter(p => p.trim());
      return {
        events: parts.map((part, index) => {
          const labelLine = part.split(/DATE:/i)[0]?.trim();
          const rest = part.split(/DATE:/i)[1] || "";
          const dateLine = rest.split(/STATUS:/i)[0]?.trim();
          const rest2 = rest.split(/STATUS:/i)[1] || "";
          const statusLine = rest2.split(/INFO:/i)[0]?.trim() as any;
          return {
            id: `e-${index}`,
            label: labelLine || "Unknown",
            date: dateLine || "TBD",
            status: ['CRITICAL', 'HIGH', 'STABLE'].includes(statusLine) ? statusLine : 'STABLE',
            description: rest2.split(/INFO:/i)[1]?.trim() || "..."
          };
        }),
        sources
      };
    } catch (error) {
      console.error("Global events fetch failed:", error);
      throw error;
    }
  });
};
