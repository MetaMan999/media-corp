
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  url?: string;
}

export interface TweetItem {
  id: string;
  user: string;
  handle: string;
  content: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timestamp: string;
}

export interface EventItem {
  id: string;
  label: string;
  date: string;
  status: 'CRITICAL' | 'HIGH' | 'STABLE';
  description: string;
}

export interface MarketData {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  lastUpdated?: string;
}

export interface MacroNode {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  context: string;
  group: 'EQUITIES' | 'COMMODITIES' | 'INDICATORS' | 'CRYPTO_MACRO';
  impact: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface NodeStatus {
  id: string;
  label: string;
  status: 'ACTIVE' | 'SYNCING' | 'OFFLINE';
  integrity: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export enum Category {
  MARKETS = 'MARKETS',
  MACRO = 'MACRO',
  DEFI = 'DEFI',
  ALTCOINS = 'ALTCOINS',
  REGULATION = 'REGULATION',
  POLITICS = 'POLITICS',
  SOCIAL = 'SOCIAL'
}
