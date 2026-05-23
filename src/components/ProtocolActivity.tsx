import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Activity, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const ProtocolActivity: React.FC = () => {
  const events = [
    { id: 1, type: 'payment', message: 'Smart Contract Payment: Netflix via USDC', time: '2m ago', status: 'success' },
    { id: 2, type: 'trigger', message: 'Auto-Trigger: Monthly Spotify Subscription', time: '15m ago', status: 'pending' },
    { id: 3, type: 'auth', message: 'MasterCard Authorization: Youtube Premium', time: '1h ago', status: 'success' },
    { id: 4, type: 'system', message: 'Arc Protocol Node Update (v2.4.1)', time: '3h ago', status: 'success' },
  ];

  return (
    <div className="bg-slate-900 rounded-[2rem] p-6 text-white border border-slate-800 shadow-2xl h-full flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-yellow-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol Activity</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
        {events.map((event, idx) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-3"
          >
            <div className={cn(
              "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
              event.status === 'success' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-yellow-500/10 border-yellow-500/20"
            )}>
              {event.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-yellow-400" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-slate-200 leading-tight">{event.message}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{event.time}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">#testnet</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-colors">
        View Explorer
      </button>
    </div>
  );
};
