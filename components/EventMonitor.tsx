
import React from 'react';
import { EventItem } from '../types';

interface EventMonitorProps {
  events: EventItem[];
  loading: boolean;
}

const EventMonitor: React.FC<EventMonitorProps> = ({ events, loading }) => {
  return (
    <aside className="bg-zinc-950 border border-zinc-800 p-4 font-mono h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">
          Event Pipeline_v2.1
        </h2>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-red-600/30"></div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-2 w-20 bg-zinc-800"></div>
              <div className="h-4 w-full bg-zinc-900"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="group border-l-2 border-zinc-800 pl-3 hover:border-red-600 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black px-1.5 py-0.5 ${
                  event.status === 'CRITICAL' ? 'bg-red-600 text-white' : 
                  event.status === 'HIGH' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {event.status}
                </span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                  {event.date}
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-100 mb-1 group-hover:text-red-400">
                {event.label}
              </h4>
              <p className="text-[10px] text-zinc-500 leading-tight">
                {event.description}
              </p>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-[10px] text-zinc-700 italic">No events currently tracked in this sector.</p>
          )}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-zinc-900">
        <div className="flex items-center gap-2 text-[8px] text-zinc-600 font-black uppercase">
          <span className="inline-block w-2 h-2 border border-zinc-600 rounded-sm"></span>
          NODE_UPLINK: ENCRYPTED
        </div>
      </div>
    </aside>
  );
};

export default EventMonitor;
