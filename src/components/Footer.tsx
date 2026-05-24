import React from 'react';
import { Brand } from './Brand';
import { Github, Twitter, Mail, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-2 px-6 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-4">
          <Brand size="xs" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
            © 2026 SubZero Protocol. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 font-extrabold">POWERED BY ARC NETWORK</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-3 border-r border-slate-150 pr-4">
            <a href="#" className="text-slate-400 hover:text-yellow-600 transition-colors">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-yellow-600 transition-colors">
              <Github className="w-3.5 h-3.5" />
            </a>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            Mainnet Q3, 2026
          </span>
        </div>
      </div>
    </footer>
  );
};
