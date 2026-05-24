import React, { useState } from 'react';
import { Brand } from './Brand';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut, Droplets, X, Sparkles, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from './FirebaseProvider';
import { signInWithGoogle, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: 'subs' | 'history' | 'faucet' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { user } = useAuth();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brand size="xs" showText={true} />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {!user ? (
              <button 
                onClick={() => signInWithGoogle()}
                className="flex items-center justify-center gap-2 py-2 px-3 sm:px-5 bg-blue-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all cursor-pointer border border-transparent shrink-0"
              >
                <span className="hidden sm:inline">Get Started with Google</span>
                <span className="sm:hidden">Get Started</span>
              </button>
            ) : (
              <>
                {/* Google Profile & Sign Out */}
                <div className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2 border-r border-slate-100 pr-2 sm:pr-3">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <button 
                    onClick={() => auth.signOut()}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-full border border-slate-200 transition-all font-black text-[9px] uppercase tracking-wider cursor-pointer shrink-0"
                    title="Sign Out of Google"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden min-[480px]:inline">Sign Out</span>
                  </button>
                </div>

                {isConnected && setActiveTab && (
                  <button
                    onClick={() => setActiveTab('faucet')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border cursor-pointer",
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
                      <button 
                        onClick={() => disconnect()}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors border border-slate-100 cursor-pointer"
                        title="Disconnect"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsWalletModalOpen(true)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 px-4 sm:px-6 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                    )}
                  >
                    <Wallet className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2rem] p-6 shadow-2xl overflow-hidden z-[101]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="space-y-0.5 text-left">
                  <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Connect Wallet</h3>
                  <p className="text-xs text-slate-500 font-medium">Select a connection for Arc Testnet</p>
                </div>
                <button 
                  onClick={() => setIsWalletModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {connectors.map((connector) => {
                  const isMock = connector.name.toLowerCase().includes('mock') || connector.id === 'mock';
                  const displayName = isMock ? "Sandbox Simulated Wallet" : connector.name;
                  return (
                    <button
                      key={connector.uid}
                      onClick={() => {
                        connect({ connector });
                        setIsWalletModalOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between w-full p-4 border rounded-2xl transition-all cursor-pointer group text-left",
                        isMock 
                          ? "bg-yellow-50/50 hover:bg-yellow-50 border-yellow-200/60 hover:border-yellow-300" 
                          : "bg-slate-50 hover:bg-slate-100/80 border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isMock ? (
                          <div className="p-2 bg-yellow-400/20 text-yellow-600 rounded-xl">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                          </div>
                        ) : (
                          <div className="p-2 bg-slate-200/50 text-slate-600 rounded-xl group-hover:bg-white transition-colors">
                            <Wallet className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-slate-900">{displayName}</p>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {isMock ? "Instant demo connection (No Extension)" : "Connects using your local device"}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full",
                        isMock 
                          ? "bg-yellow-400 text-black font-extrabold shadow-sm shadow-yellow-400/10" 
                          : "bg-slate-900 text-white"
                      )}>
                        {isMock ? "Fast Play" : "Link"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-left">
                <Smartphone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0 animate-pulse" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Mobile Tip</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    If webview triggers are blocked or fail to open external apps, launch with the <strong>Sandbox Simulated Wallet</strong> to explore subscription actions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
