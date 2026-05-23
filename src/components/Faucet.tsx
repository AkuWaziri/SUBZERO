import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Droplets, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/utils';

interface FaucetProps {
  walletBalance?: number;
  onMint?: (amount: number) => void;
}

export const Faucet: React.FC<FaucetProps> = ({ walletBalance, onMint }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMint = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      if (onMint) {
        onMint(1000);
      }
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
      });

      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6 shadow-sm overflow-hidden relative group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Arc Faucet</h3>
          <p className="text-slate-500 text-sm">Need test tokens? Mint 1,000 USDC instantly for protocol testing.</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
          <Droplets className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Balance</p>
          <p className="text-2xl font-black text-slate-900">
            {formatCurrency(walletBalance !== undefined ? walletBalance : 5240.25, 'USD')}
          </p>
        </div>
        <button 
          onClick={handleMint}
          disabled={isLoading || showSuccess}
          className={cn(
            "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
            showSuccess ? "bg-emerald-500 text-white" : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <>
              Mint Tokens
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 font-medium"> Tokens are for testnet use only and hold no real value. Limit: 1 mint per 24 hours.</p>
    </div>
  );
};
