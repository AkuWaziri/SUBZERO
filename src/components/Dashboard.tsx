import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { useAuth } from './FirebaseProvider';
import { db, auth } from '../lib/firebase';
import { Subscription, Payment, UserProfile, AppTheme, PaymentMethod, DiscoverItem } from '../types';
import { formatCurrency, handleFirestoreError, OperationType } from '../lib/utils';
import { ProtocolActivity } from './ProtocolActivity';
import { Faucet } from './Faucet';
import { Footer } from './Footer';
import { 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  History,
  XCircle,
  Play,
  Trash2,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  BarChart3,
  Zap,
  ShoppingBag,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ChevronRight,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Brand } from './Brand';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId, useBalance } from 'wagmi';
import { arcTestnet } from './Web3Provider';
import { Wallet, Globe, Unlock, ExternalLink, LogOut as LogOutIcon } from 'lucide-react';
import { Navbar } from './Navbar';

const THEMES: Record<AppTheme, { primary: string, secondary: string, accent: string, hex: string }> = {
  blue: { primary: 'blue-600', secondary: 'blue-500', accent: 'blue-400', hex: '#2563eb' },
  orange: { primary: 'orange-600', secondary: 'orange-500', accent: 'orange-400', hex: '#ea580c' },
  purple: { primary: 'purple-600', secondary: 'purple-500', accent: 'purple-400', hex: '#9333ea' },
  green: { primary: 'emerald-600', secondary: 'emerald-500', accent: 'emerald-400', hex: '#059669' },
  slate: { primary: 'slate-600', secondary: 'slate-500', accent: 'slate-400', hex: '#475569' },
  yellow: { primary: 'yellow-400', secondary: 'blue-600', accent: 'slate-400', hex: '#FACC15' },
};

const DISCOVER_ITEMS: DiscoverItem[] = [
  { id: 'netflix', name: 'Netflix', amount: 15.49, currency: 'USD', category: 'Entertainment', description: 'Stream your favorite movies and shows.' },
  { id: 'spotify', name: 'Spotify', amount: 10.99, currency: 'USD', category: 'Music', description: 'Millions of songs and podcasts.' },
  { id: 'youtube', name: 'YouTube Premium', amount: 13.99, currency: 'USD', category: 'Entertainment', description: 'Ad-free video and music.' },
  { id: 'chatgpt', name: 'ChatGPT Plus', amount: 20.00, currency: 'USD', category: 'AI & Productivity', description: 'Experience the latest AI advancements.' },
  { id: 'midjourney', name: 'Midjourney', amount: 30.00, currency: 'USD', category: 'AI & Design', description: 'Professional AI image generation.' },
  { id: 'claude', name: 'Claude Pro', amount: 18.50, currency: 'USD', category: 'AI & Productivity', description: 'Next-gen AI assistant for advanced tasks.' },
  { id: 'crunchyroll', name: 'Crunchyroll', amount: 7.99, currency: 'USD', category: 'Entertainment', description: 'World\'s largest anime collection.' },
  { id: 'notion', name: 'Notion Plus', amount: 8.00, currency: 'USD', category: 'Productivity', description: 'Connected workspace for better planning.' },
];

const triggerConfetti = () => {
  // Center main blast
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308']
  });

  // Dual side cannons
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308']
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#eab308']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { data: arcBalance } = useBalance({
    address: address,
    token: '0x0000000000085d4780B73119b644AE5ecd22b376',
  } as any);
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ai' | 'manual'>('ai');
  const [manualName, setManualName] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCategory, setManualCategory] = useState('Entertainment');
  const [manualFrequency, setManualFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'subs' | 'history' | 'faucet' | 'settings'>('subs');
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('usdc');
  const [confirmation, setConfirmation] = useState<{ type: 'unsubscribe' | 'delete' | 'resume', subscription: Subscription } | null>(null);
  const [showPaymentSelection, setShowPaymentSelection] = useState<DiscoverItem | null>(null);

  const theme = 'yellow';
  const colors = THEMES[theme];

  useEffect(() => {
    if (!user) return;

    const subsPath = `users/${user.uid}/subscriptions`;
    const unsubSubs = onSnapshot(
      query(collection(db, subsPath), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, subsPath)
    );

    const paymentsPath = `users/${user.uid}/payments`;
    const unsubPayments = onSnapshot(
      query(collection(db, paymentsPath), orderBy('date', 'desc'), limit(10)),
      (snapshot) => {
        setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, paymentsPath)
    );

    const profilePath = `users/${user.uid}`;
    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          // Initialize profile cleanly with the user's UID as doc ID
          setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            monthlyBudget: 1000,
            currency: 'USD',
            theme: 'yellow',
            createdAt: serverTimestamp()
          }).catch(err => console.error("Profile init error:", err));
        }
      }
    );

    return () => {
      unsubSubs();
      unsubPayments();
      unsubProfile();
    };
  }, [user]);

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('subzero_usdc_balance');
    return saved ? parseFloat(saved) : 5240.25;
  });

  useEffect(() => {
    localStorage.setItem('subzero_usdc_balance', walletBalance.toString());
  }, [walletBalance]);

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => {
      const amount = s.amount;
      if (s.frequency === 'monthly') return acc + amount;
      if (s.frequency === 'yearly') return acc + (amount / 12);
      if (s.frequency === 'weekly') return acc + (amount * 4.33);
      return acc;
    }, 0);

  const handleUnsubscribe = async (sub: Subscription) => {
    try {
      await updateDoc(doc(db, `users/${user?.uid}/subscriptions`, sub.id), {
        status: 'unsubscribed',
        updatedAt: serverTimestamp()
      });
      setConfirmation(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${sub.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${user?.uid}/subscriptions`, id));
      setConfirmation(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `subscriptions/${id}`);
    }
  };

  const handleAiAdd = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ai/parse-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiInput })
      });
      const data = await response.json();
      
      const subData = {
        ...data,
        userId: user?.uid,
        status: 'active',
        paymentMethod: selectedPaymentMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      };

      await addDoc(collection(db, `users/${user?.uid}/subscriptions`), subData);
      
      // Add record to transactions history
      await addDoc(collection(db, `users/${user?.uid}/payments`), {
        subscriptionName: data.name || "AI Subscription",
        amount: data.amount || 10.00,
        currency: data.currency || 'USD',
        date: new Date(),
        status: 'completed'
      });

      // Deduct USDC if selected
      if (selectedPaymentMethod === 'usdc') {
        const subAmount = data.amount || 10.00;
        setWalletBalance(prev => Math.max(0, prev - subAmount));
      }

      setAiInput("");
      setIsAddModalOpen(false);
      triggerConfetti();
    } catch (err) {
      console.error("AI Error:", err);
      alert("Failed to parse subscription. Please try manual entry.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualName.trim() || !manualAmount) {
      alert("Please fill in name and amount.");
      return;
    }
    const amt = parseFloat(manualAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsAiLoading(true);
    try {
      const subData = {
        name: manualName.trim(),
        amount: amt,
        currency: 'USD',
        category: manualCategory,
        frequency: manualFrequency,
        userId: user?.uid,
        status: 'active',
        paymentMethod: selectedPaymentMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await addDoc(collection(db, `users/${user?.uid}/subscriptions`), subData);

      await addDoc(collection(db, `users/${user?.uid}/payments`), {
        subscriptionName: manualName.trim(),
        amount: amt,
        currency: 'USD',
        date: new Date(),
        status: 'completed'
      });

      if (selectedPaymentMethod === 'usdc') {
        setWalletBalance(prev => Math.max(0, prev - amt));
      }

      setManualName("");
      setManualAmount("");
      setManualCategory("Entertainment");
      setManualFrequency("monthly");
      setIsAddModalOpen(false);
      triggerConfetti();
    } catch (err) {
      console.error("Manual Save Error:", err);
      handleFirestoreError(err, OperationType.CREATE, 'subscriptions');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickSubscribe = async (item: DiscoverItem, method: PaymentMethod) => {
    try {
      const subData = {
        name: item.name,
        amount: item.amount,
        currency: item.currency,
        category: item.category,
        userId: user?.uid,
        status: 'active',
        paymentMethod: method,
        frequency: 'monthly',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await addDoc(collection(db, `users/${user?.uid}/subscriptions`), subData);

      // Add record to transactions history
      await addDoc(collection(db, `users/${user?.uid}/payments`), {
        subscriptionName: item.name,
        amount: item.amount,
        currency: item.currency,
        date: new Date(),
        status: 'completed'
      });

      // Deduct USDC if selected
      if (method === 'usdc') {
        setWalletBalance(prev => Math.max(0, prev - item.amount));
      }

      setShowPaymentSelection(null);
      triggerConfetti();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'subscriptions');
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen text-slate-900 h-screen overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-72 border-r border-slate-200 flex-col p-6 bg-white shrink-0">
          <div className="flex-1 space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Menu</h3>
            <NavButton 
              active={activeTab === 'subs'} 
              onClick={() => setActiveTab('subs')}
              icon={<Zap className="w-5 h-5" />}
              label="Overview"
              themeColor={colors.primary}
            />
            <NavButton 
               active={activeTab === 'history'} 
               onClick={() => setActiveTab('history')}
               icon={<History className="w-5 h-5" />}
               label="Transactions"
               themeColor={colors.primary}
            />
            <NavButton 
               active={activeTab === 'faucet'} 
               onClick={() => setActiveTab('faucet')}
               icon={<Droplets className="w-5 h-5" />}
               label="Get USDC"
               themeColor={colors.primary}
            />
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<Settings className="w-5 h-5" />}
              label="Config"
              themeColor={colors.primary}
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => auth.signOut()}
              className="flex w-full items-center gap-3 p-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-[1.25rem] transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-black uppercase tracking-widest text-[10px]">Sign Out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Protocol</h2>
                  <p className="text-slate-500 font-bold tracking-tight text-lg">Total Automated Subscription Control</p>
                </div>
                
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-8 py-3.5 bg-yellow-400 text-black rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-yellow-400/20 hover:scale-105 active:scale-95 border-2 border-black"
                >
                  <Plus className="w-5 h-5 stroke-[3px]" />
                  Secure Subscription
                </button>
              </div>

            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 space-y-12">
                {activeTab === 'subs' && (
                  <div className="space-y-12">
                    {/* Stats Section moved inside Tab to be contextual */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      <StatCard 
                        label="USDC Balance"
                        value={isConnected ? formatCurrency(walletBalance, 'USD') : "Connect Wallet"}
                        trend={isConnected ? "Protocol Wallet" : "Action Required"}
                        icon={<Globe className="w-5 h-5 text-blue-500" />}
                      />
                      <StatCard 
                        label="Monthly Spend"
                        value={formatCurrency(totalMonthly, profile?.currency)}
                        trend={`-$${(totalMonthly * 0.05).toFixed(2)} vs last month`}
                        icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                      />
                      <StatCard 
                        label="Protocol Budget"
                        value={formatCurrency((profile?.monthlyBudget || 1000) - totalMonthly, profile?.currency)}
                        trend={`${Math.round(((profile?.monthlyBudget || 1000) - totalMonthly) / (profile?.monthlyBudget || 1000) * 100)}% capacity`}
                        icon={<BarChart3 className="w-5 h-5 text-slate-500" />}
                        progress={totalMonthly / (profile?.monthlyBudget || 1000)}
                        themeColor={colors.primary}
                      />
                      <StatCard 
                        label="Connected Apps"
                        value={subscriptions.filter(s => s.status === 'active').length.toString()}
                        trend="Secure Connections"
                        icon={<Zap className="w-5 h-5 text-yellow-500" />}
                      />
                    </div>
                {/* Discover Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Discover</h3>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {DISCOVER_ITEMS.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold uppercase border border-white/5 shrink-0">
                            {item.name[0]}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="font-bold text-lg leading-none truncate">{item.name}</h4>
                            <p className="text-slate-400 text-xs truncate">{item.description}</p>
                            <p className="text-yellow-400 text-[10px] uppercase font-black tracking-widest">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3 shrink-0">
                          <div>
                            <p className="font-black text-xl leading-none">{formatCurrency(item.amount, item.currency)}</p>
                            <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">Monthly</p>
                          </div>
                          <button 
                            onClick={() => setShowPaymentSelection(item)}
                            className="px-6 py-2.5 bg-yellow-400 text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all font-semibold"
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
 
                {/* Upcoming Timeline */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Upcoming Payments</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {subscriptions.filter(s => s.status === 'active').sort((a, b) => (a.nextPaymentDate?.seconds || 0) - (b.nextPaymentDate?.seconds || 0)).map((sub) => (
                       <div key={sub.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3">
                         <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                             {sub.nextPaymentDate?.toDate ? format(sub.nextPaymentDate.toDate(), 'MMM dd') : 'Soon'}
                           </p>
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                         </div>
                         <div className="flex items-center gap-3 min-w-0">
                           <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-bold text-slate-900 shrink-0">
                             {sub.name[0]}
                           </div>
                           <div className="min-w-0 flex-1">
                             <p className="text-xs font-bold text-slate-900 leading-tight truncate">{sub.name}</p>
                             <p className="text-[11px] font-black text-blue-600">{formatCurrency(sub.amount, sub.currency)}</p>
                           </div>
                         </div>
                       </div>
                    ))}
                    {subscriptions.filter(s => s.status === 'active').length === 0 && (
                      <div className="col-span-full py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-slate-400 text-sm italic">No upcoming payments scheduled.</p>
                      </div>
                    )}
                  </div>
                </section>
 
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className={cn("w-5 h-5", `text-${colors.primary}`)} />
                      <h3 className="text-xl font-black uppercase tracking-tighter">Your Subscriptions</h3>
                    </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    Active
                    <span className="w-3 h-3 rounded-full bg-red-400 ml-2"></span>
                    Unsubscribed
                  </div>
                </div>
 
                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {subscriptions.map((sub) => (
                      <motion.div
                        key={sub.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group shadow-sm",
                          sub.status === 'active' ? "bg-white border-slate-100 hover:shadow-xl hover:-translate-y-1" : "bg-slate-50 border-slate-100 grayscale opacity-80"
                        )}
                      >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl font-black uppercase text-slate-900 border border-slate-100 shrink-0">
                                {sub.name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-2xl text-slate-900 leading-none tracking-tight truncate">{sub.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                        {sub.category}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border shadow-sm",
                                        sub.amount > 20 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    )}>
                                        {sub.amount > 20 ? 'High Usage' : 'Optimal'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black tracking-widest mt-3">
                                    <Calendar className="w-3 h-3" />
                                    Next Billing: <span className="text-slate-900 ml-1">{sub.nextPaymentDate?.toDate ? format(sub.nextPaymentDate.toDate(), 'MMM dd, yyyy') : 'Manual Trigger'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 shrink-0 pl-0 md:pl-6 md:border-l border-slate-100">
                            <div className="text-left md:text-right">
                                <p className="font-black text-3xl text-slate-900 tracking-tighter leading-none">{formatCurrency(sub.amount, sub.currency)}</p>
                                <div className="flex items-center justify-start md:justify-end gap-1.5 mt-2">
                                    {sub.paymentMethod === 'usdc' ? (
                                        <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-blue-500 shadow-sm">
                                            <Wallet className="w-2 h-2" />
                                            USDC
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-slate-800 shadow-sm">
                                            <CreditCard className="w-2 h-2" />
                                            Master
                                        </div>
                                    )}
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">{sub.frequency}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {sub.status === 'active' ? (
                                    <button 
                                        onClick={() => setConfirmation({ 
                                            type: 'unsubscribe', 
                                            subscription: sub 
                                        })}
                                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-red-100"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Unsubscribe
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setConfirmation({ 
                                            type: 'resume', 
                                            subscription: sub 
                                        })}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100"
                                    >
                                        <Play className="w-4 h-4" />
                                        Restart
                                    </button>
                                )}
                                <button 
                                    onClick={() => setConfirmation({ type: 'delete', subscription: sub })}
                                    className="p-2 hover:bg-slate-800 hover:text-white rounded-xl transition-colors bg-white border border-slate-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Risk Indicator */}
                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {sub.amount > 50 ? (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-bl-xl bg-red-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  Risk: High
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-bl-xl bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Protocol Verified
                                </div>
                            )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {subscriptions.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-850 rounded-3xl">
                      <AlertCircle className="w-12 h-12 text-slate-750 mx-auto mb-4" />
                      <p className="text-slate-500">No subscriptions found. Add your first one above!</p>
                    </div>
                  )}
                </div>

                {/* Integrated Transaction History */}
                <div className="space-y-6 pt-10 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Recent Subscription Payments</h3>
                  </div>
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[550px] md:min-w-0">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-4 md:px-8 py-4 md:py-6">Subscription</th>
                          <th className="px-4 md:px-8 py-4 md:py-6">Date</th>
                          <th className="px-4 md:px-8 py-4 md:py-6">Amount</th>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {payments.slice(0, 5).map(payment => (
                          <tr key={payment.id} className="hover:bg-slate-50/55 transition-colors group">
                            <td className="px-4 md:px-8 py-4 md:py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold shrink-0">
                                   {payment.subscriptionName ? payment.subscriptionName[0] : 'S'}
                                 </div>
                                 <span className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">{payment.subscriptionName}</span>
                              </div>
                            </td>
                            <td className="px-4 md:px-8 py-4 md:py-6 text-slate-550 text-xs sm:text-sm font-medium">
                              {payment.date?.toDate ? format(payment.date.toDate(), 'MMM dd, yyyy') : 'Recently'}
                            </td>
                            <td className="px-4 md:px-8 py-4 md:py-6 font-black text-slate-900 text-xs sm:text-sm">{formatCurrency(payment.amount, payment.currency)}</td>
                            <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                payment.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                              )}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {payments.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 md:px-8 py-16 md:py-20 text-center text-slate-400 italic text-sm">
                               No payment transactions triggered yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-500" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Transaction History</h3>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[550px] md:min-w-0">
                    <thead>
                      <tr className="border-b border-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-4 md:px-8 py-4 md:py-6">Subscription</th>
                        <th className="px-4 md:px-8 py-4 md:py-6">Date</th>
                        <th className="px-4 md:px-8 py-4 md:py-6">Amount</th>
                        <th className="px-4 md:px-8 py-4 md:py-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 md:px-8 py-4 md:py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold">
                                 {payment.subscriptionName[0]}
                               </div>
                               <span className="font-bold text-slate-900">{payment.subscriptionName}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-8 py-4 md:py-6 text-slate-500 text-sm font-medium">
                            {payment.date?.toDate ? format(payment.date.toDate(), 'MMM dd, yyyy') : 'Unknown'}
                          </td>
                          <td className="px-4 md:px-8 py-4 md:py-6 font-black text-slate-900">{formatCurrency(payment.amount, payment.currency)}</td>
                          <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                              payment.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                            )}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 md:px-8 py-16 md:py-20 text-center text-slate-400 italic">
                             Waiting for protocol triggers... 
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'faucet' && (
              <div className="space-y-10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Get USDC Arc Network</h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Faucet Component */}
                  <Faucet walletBalance={walletBalance} onMint={(amount) => setWalletBalance(prev => prev + amount)} />

                  {/* Instruction Manual card */}
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl border border-yellow-105">
                        <ShieldCheck className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-widest text-slate-950">Integration Guide</h4>
                        <p className="text-slate-500 text-xs">Steps to register Arc Network and mint tokens.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-700 border border-slate-100">1</div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Connect Web3 Wallet</p>
                          <p className="text-slate-500 text-[11px] leading-relaxed">Ensure your metamask or web3 wallet injection is active using the header connection buttons.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-700 border border-slate-100">2</div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Switch to Arc Testnet</p>
                          <p className="text-slate-500 text-[11px] leading-relaxed">Simply click the Switch to Arc banner to automatically add and register Arc chain parameters in your wallet extension.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-700 border border-slate-100">3</div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Mint 1,000 test USDC</p>
                          <p className="text-slate-500 text-[11px] leading-relaxed">Use the Faucet interface on the left to mint test USDC. Our protocol listens and registers mock transactions instantly.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tokens Contract</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('0x0000000000085d4780B73119b644AE5ecd22b376');
                        }}
                        className="text-[10px] font-mono hover:text-blue-600 text-slate-500 transition-colors uppercase font-black"
                        title="Click to copy contract"
                      >
                        Copy contract address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-10">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">Protocol Configuration</h3>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <label className="block text-xl font-black uppercase tracking-tighter text-slate-900">Spending Limit</label>
                        <p className="text-slate-500 text-sm">Automated protocol pause once limit is reached.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-4">
                        <span className="text-slate-400 font-bold">$</span>
                        <input 
                          type="number" 
                          defaultValue={profile?.monthlyBudget}
                          onBlur={async (e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              await updateDoc(doc(db, 'users', user?.uid!), { monthlyBudget: val });
                            }
                          }}
                          className="bg-transparent w-full outline-none font-black text-2xl text-slate-900"
                        />
                      </div>
                      <div className="bg-slate-900 text-white rounded-2xl px-8 flex items-center font-black text-xs uppercase tracking-widest">
                        USDC
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-105 rounded-xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                      <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                        Setting a spending limit helps prevent wallet drain from malicious or unwanted subscription increases.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-8 space-y-6 text-white border border-slate-800 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-yellow-400" />
                      <h4 className="text-xl font-black uppercase tracking-tighter">Chain Status</h4>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Network</span>
                          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Arc Testnet
                          </span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Oracle Health</span>
                          <span className="text-white text-xs font-black uppercase tracking-widest">Synchronized</span>
                       </div>
                       <div className="flex justify-between items-center py-3">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Wallet</span>
                          <span className="font-mono text-xs text-slate-300">
                             {address?.slice(0, 6)}...{address?.slice(-4)}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Protocol Feed */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-0 h-fit bg-white/50 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-100">
             <ProtocolActivity />
          </aside>
        </div>
        
        {/* Scrollable footer housed inside the scrollable region of main */}
        <div className="pt-16 pb-24 md:pb-6 mt-auto">
          <Footer />
        </div>
      </div>
    </main>

    {/* Mobile Navigation Bar */}
    <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 flex items-center justify-around z-50 md:hidden pb-safe shadow-lg">
      <MobileNavButton
        active={activeTab === 'subs'}
        onClick={() => setActiveTab('subs')}
        icon={<Zap className="w-5 h-5" />}
        label="Overview"
        themeColor={colors.primary}
      />
      <MobileNavButton
        active={activeTab === 'history'}
        onClick={() => setActiveTab('history')}
        icon={<History className="w-5 h-5" />}
        label="History"
        themeColor={colors.primary}
      />
      <MobileNavButton
        active={activeTab === 'faucet'}
        onClick={() => setActiveTab('faucet')}
        icon={<Droplets className="w-5 h-5" />}
        label="Get USDC"
        themeColor={colors.primary}
      />
      <MobileNavButton
        active={activeTab === 'settings'}
        onClick={() => setActiveTab('settings')}
        icon={<Settings className="w-5 h-5" />}
        label="Config"
        themeColor={colors.primary}
      />
    </nav>
  </div>
</div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsAddModalOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* AI Glow */}
              <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10", `bg-${colors.secondary}`)} />
              
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("p-2 rounded-xl border", `bg-${colors.secondary}/10 border-${colors.secondary}/20`)}>
                  <Sparkles className={cn("w-6 h-6", `text-${colors.secondary}`)} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Add Subscription</h3>
                  <p className="text-slate-500 text-sm">Tell SubZero what you want to track.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Modal Mode Selector */}
                <div className="flex bg-slate-100 rounded-2xl p-1 mb-2">
                  <button
                    onClick={() => setModalMode('ai')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      modalMode === 'ai' ? "bg-white text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Smart Scan
                  </button>
                  <button
                    onClick={() => setModalMode('manual')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                      modalMode === 'manual' ? "bg-white text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Manual Details
                  </button>
                </div>

                {modalMode === 'ai' ? (
                  <div className="relative">
                    <textarea 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="e.g. Netflix for $15.99 monthly in Entertainment category"
                      className={cn(
                        "w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 pt-4 outline-none focus:ring-2 transition-all resize-none text-slate-900",
                        `focus:ring-${colors.secondary}`
                      )}
                    />
                    <div className={cn("absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 border rounded-full", `bg-${colors.secondary}/10 border-${colors.secondary}/20`)}>
                      <BrainCircuit className={cn("w-3.5 h-3.5", `text-${colors.accent}`)} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", `text-${colors.accent}`)}>AI Powered</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription Name</label>
                      <input 
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="e.g. Netflix"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-slate-900 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price ($)</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          placeholder="e.g. 15.99"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-slate-900 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frequency</label>
                        <select
                          value={manualFrequency}
                          onChange={(e) => setManualFrequency(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-slate-900 text-sm appearance-none"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-slate-900 text-sm appearance-none"
                      >
                        <option value="Entertainment">Entertainment</option>
                        <option value="Productivity">Productivity</option>
                        <option value="SaaS">SaaS</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}
 
                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedPaymentMethod('usdc')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        selectedPaymentMethod === 'usdc' ? "bg-blue-600/5 border-blue-600 text-blue-600 shadow-lg shadow-blue-600/10" : "bg-slate-50 border-slate-100 text-slate-400 grayscale"
                      )}
                    >
                      <Wallet className="w-5 h-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-black text-[10px] uppercase tracking-widest opacity-60 line-height-none">USDC Balance</span>
                        <span className="font-black text-sm uppercase tracking-tight">{formatCurrency(walletBalance, 'USD')}</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setSelectedPaymentMethod('mastercard')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        selectedPaymentMethod === 'mastercard' ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-slate-50 border-slate-100 text-slate-400 grayscale"
                      )}
                    >
                      <CreditCard className="w-5 h-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-black text-[10px] uppercase tracking-widest opacity-60 line-height-none">Credit Limit</span>
                        <span className="font-black text-sm uppercase tracking-tight">$15,000.00</span>
                      </div>
                    </button>
                  </div>
                </div>
 
                <div className="grid grid-cols-2 gap-3">
                   {modalMode === 'ai' ? (
                     <button 
                      disabled={isAiLoading || !aiInput.trim()}
                      onClick={handleAiAdd}
                      className={cn(
                        "col-span-2 py-4 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all group border-2 border-black",
                        `bg-${colors.primary} hover:bg-${colors.secondary} shadow-${colors.primary}/20`
                      )}
                     >
                      {isAiLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
                          Smart Add Subscription
                        </>
                      )}
                     </button>
                   ) : (
                     <button 
                      disabled={isAiLoading || !manualName.trim() || !manualAmount}
                      onClick={handleManualAdd}
                      className="col-span-2 py-4 disabled:opacity-50 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                     >
                      {isAiLoading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5 stroke-[3px]" />
                          Secure Subscription
                        </>
                      )}
                     </button>
                   )}
                   <p className="col-span-2 text-center text-slate-500 text-xs">
                     {modalMode === 'ai' ? "Just type naturally! Our AI extracts name, price, and category." : "Fill in correct specifications to register transaction."}
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setConfirmation(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-8 shadow-3xl text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className={cn(
                  "p-4 rounded-2xl",
                  confirmation.type === 'delete' || confirmation.type === 'unsubscribe' ? "bg-red-50 text-red-600" : `bg-${colors.secondary}/10 text-${colors.secondary}`
                )}>
                  {confirmation.type === 'delete' ? <Trash2 className="w-8 h-8" /> : 
                   confirmation.type === 'unsubscribe' ? <XCircle className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">
                  {confirmation.type === 'delete' ? 'Delete' : confirmation.type === 'unsubscribe' ? 'Unsubscribe' : 'Resume'} Confirmation
                </h3>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to {confirmation.type === 'unsubscribe' ? 'unsubscribe from' : confirmation.type} <strong>{confirmation.subscription.name}</strong>?
                  {confirmation.type === 'delete' && " This action cannot be undone."}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => {
                    if (confirmation.type === 'delete') handleDelete(confirmation.subscription.id);
                    else if (confirmation.type === 'unsubscribe') handleUnsubscribe(confirmation.subscription);
                    else if (confirmation.type === 'resume') {
                      // We can repurpose updateDoc here or add a handleResume
                      updateDoc(doc(db, `users/${user?.uid}/subscriptions`, confirmation.subscription.id), {
                        status: 'active',
                        updatedAt: serverTimestamp()
                      });
                      setConfirmation(null);
                    }
                  }}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                    confirmation.type === 'delete' || confirmation.type === 'unsubscribe' ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20" : `bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20`
                  )}
                >
                  Confirm {confirmation.type}
                </button>
                <button 
                  onClick={() => setConfirmation(null)}
                  className="w-full py-4 text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPaymentSelection && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowPaymentSelection(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-3xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl font-bold uppercase mx-auto mb-4">
                  {showPaymentSelection.name[0]}
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  Subscribe to {showPaymentSelection.name}
                </h3>
                <p className="text-slate-500 text-sm">
                  Choose your preferred payment method for this {formatCurrency(showPaymentSelection.amount, showPaymentSelection.currency)}/mo subscription.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleQuickSubscribe(showPaymentSelection, 'usdc')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all font-black text-xs uppercase tracking-widest group"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] opacity-80 uppercase font-black tracking-widest">USDC Balance</span>
                      <span className="text-sm font-black">{formatCurrency(walletBalance, 'USD')}</span>
                    </div>
                  </div>
                  <div className="bg-white/20 px-2 py-1 rounded text-[8px] font-black">FAST</div>
                </button>
                <button 
                  onClick={() => handleQuickSubscribe(showPaymentSelection, 'mastercard')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    MasterCard
                  </div>
                </button>
                <button 
                  onClick={() => setShowPaymentSelection(null)}
                  className="w-full py-4 text-slate-400 hover:text-slate-900 font-bold transition-colors text-xs uppercase tracking-widest"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, themeColor }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, themeColor: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
      active ? `bg-${themeColor} text-white shadow-lg shadow-${themeColor}/20` : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
    )}
  >
    <span className={cn("transition-transform", !active && "group-hover:scale-110")}>{icon}</span>
    <span className="font-semibold hidden md:block">{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon, label, themeColor }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, themeColor: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 flex-1 transition-all",
      active ? `text-${themeColor}` : "text-slate-500"
    )}
  >
    <div className={cn(
      "p-1 rounded-lg transition-colors",
      active ? `bg-${themeColor}/10` : "bg-transparent"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const StatCard = ({ label, value, trend, icon, progress, themeColor }: { label: string, value: string, trend: string, icon: React.ReactNode, progress?: number, themeColor?: string }) => {
  const displayProgress = progress !== undefined ? Math.min(progress, 1.5) : undefined;
  const percentageString = progress !== undefined ? `${Math.round(Math.min(progress * 100, 999))}%` : '';

  // Decompose label to wrap into two lines nicely for tight viewports, matching the attached image design style
  const labelParts = label.split(' ');
  const displayLabel = labelParts.length > 1 ? (
    <>
      <span className="block">{labelParts[0]}</span>
      <span className="block text-slate-500 font-bold">{labelParts.slice(1).join(' ')}</span>
    </>
  ) : (
    <span className="block">{label}</span>
  );

  return (
    <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-[2rem] flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-all group relative overflow-hidden min-h-[175px]">
      <div className="flex justify-between items-start">
        <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all text-slate-800 shrink-0">
          {icon}
        </div>
        <div className="w-8 h-1 bg-slate-100 rounded-full mt-2 shrink-0" />
      </div>
      
      <div className="space-y-2 mt-auto">
        <div className="space-y-1">
          <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] leading-tight">
            {displayLabel}
          </p>
          <p className="text-lg xs:text-xl sm:text-2xl lg:text-md xl:text-xl 2xl:text-2xl font-black text-slate-900 tracking-tighter leading-none pr-1">
            {value}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-55 flex flex-col justify-center min-h-[30px]">
          {displayProgress !== undefined ? (
             <div className="space-y-1 w-full">
               <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(displayProgress * 100, 100)}%` }}
                   className={cn("h-full transition-all", displayProgress > 0.9 ? "bg-red-500" : `bg-yellow-400`)}
                 />
               </div>
               <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                 <p className="text-slate-400 truncate max-w-[70%]" title={trend}>{trend}</p>
                 <p className="text-slate-900 shrink-0">{percentageString}</p>
               </div>
             </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-hidden font-sans text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-slate-500 truncate" title={trend}>{trend}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

