import React from 'react';
import { Brand } from './Brand';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { arcTestnet } from './Web3Provider';
import { Wallet, LogOut, Shield, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: 'subs' | 'history' | 'faucet' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const isArcChain = isConnected && (chain?.id === arcTestnet.id || chainId === arcTestnet.id);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-1.5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brand size="xs" showText={true} />
        </div>

        <div className="flex items-center gap-4">
          {isConnected && setActiveTab && (
            <button
              onClick={() => setActiveTab('faucet')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border",
                activeTab === 'faucet'
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Droplets className="w-3.5 h-3.5 fill-blue-500/20 text-blue-500" />
              <span>Get USDC</span>
            </button>
          )}

          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arc Testnet</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isArcChain ? (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <button 
                    onClick={() => switchChain({ chainId: arcTestnet.id })}
                    className="px-3 py-1.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-tighter hover:bg-yellow-300 transition-colors shadow-sm"
                  >
                    Switch to Arc
                  </button>
                )}
                <button 
                  onClick={() => disconnect()}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors border border-slate-100"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-6 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
