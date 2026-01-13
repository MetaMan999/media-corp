
import React from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <div className="group border-b border-zinc-800 py-6 last:border-0 hover:bg-zinc-900/30 transition-colors cursor-pointer px-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 tracking-tighter">
              {news.category.toUpperCase()}
            </span>
            <span className="text-zinc-500 text-[10px] font-bold">
              {news.timestamp} IST
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-3 leading-tight group-hover:text-red-500 transition-colors">
            {news.title}
          </h3>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-3xl">
            {news.summary}
          </p>
        </div>
        <div className="hidden md:block w-32 h-24 bg-zinc-800 overflow-hidden">
           <img 
            src={`https://picsum.photos/seed/${news.id}/200/150`} 
            alt="News" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
           />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
