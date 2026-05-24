import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  AlertCircle, 
  Globe, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  TrendingUp, 
  Coins 
} from 'lucide-react';
import { signInWithGoogle, signInWithGoogleRedirect } from '../lib/firebase';
import { Brand } from './Brand';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

const PITCH_SLIDES = [
  {
    tag: "The Pain Point",
    title: "The Silent Wallet Drain",
    subtitle: "Subscriptions are strategically engineered to be forgotten.",
    description: "We've all been there: signing up for a 'free 3-day trial' only to get hit with a surprise $120 annual charge three days later. With subscriptions scattered across old credit cards, Gmail accounts, and web3 wallets, tracking them is a cognitive nightmare. Out-of-sight means out-of-pocket.",
    badge: "THE PROBLEM",
    stat: "84%",
    statLabel: "of users underestimate their true monthly recurring subscription costs",
    colorTheme: "from-rose-500 to-orange-500 font-extrabold uppercase",
    bgAccent: "bg-rose-50/50 border-rose-100",
    bulletPoints: [
      "Trials sneakily roll over into expensive annual commitments",
      "Scattered billing records between corporate cards and web3 accounts",
      "Wasted capital on services and APIs you haven't opened in months"
    ]
  },
  {
    tag: "The Fragmented Reality",
    title: "Web2 Mastercard vs. Web3 Stablecoins",
    subtitle: "Two disconnected systems, one unified solution.",
    description: "Traditional banking networks are slow, manual, and rely on complicated refund tickets. Meanwhile, web3 blockchain streams are highly technical and lack user-friendly tracking. SubZero breaks down this wall, bringing traditional Mastercard transactions and on-chain USDC payments into a single frame of reference.",
    badge: "THE INTEGRATION",
    stat: "Unified",
    statLabel: "Web2 Mastercard billing & Web3 USDC stablecoin streams tracked in one container",
    colorTheme: "from-blue-600 to-cyan-500 font-extrabold uppercase",
    bgAccent: "bg-blue-50/50 border-blue-100",
    bulletPoints: [
      "Track standard Mastercard charges on-demand",
      "Monitor, sign, and authorize Web3 stream endpoints",
      "Unified telemetry log of dynamic protocol activity"
    ]
  },
  {
    tag: "The SubZero Shield",
    title: "Absolute Real-Time Sovereignty",
    subtitle: "Regain complete authority over your capital.",
    description: "Through Arc's account abstraction and secure personal state vaults, SubZero empowers you to halt, pause, or adjust subscription priorities with a single tap. Before any renewed payment occurs, we calculate smart limits, send high-visibility alerts, and let you unilaterally block authorization.",
    badge: "OUR ADVANTAGE",
    stat: "1 Click",
    statLabel: "Immediate unilateral cancellation capabilities for any registered subscription model",
    colorTheme: "from-emerald-600 to-teal-500 font-extrabold uppercase",
    bgAccent: "bg-emerald-50/50 border-emerald-100",
    bulletPoints: [
      "Frictionless simulation via our built-in Arc web3 faucet",
      "Proactive alerts dispatched before renewals trigger",
      "Smart limits optimized to prevent billing overcharges"
    ]
  },
  {
    tag: "The Roadmap",
    title: "Our Mainnet Paradigm",
    subtitle: "Scaling from testnet prototype to live ecosystem.",
    description: "We are proudly live on Arc Testnet, utilizing USDC gas parameters for real-time sandbox verification. As we progress, we are engineering virtual cards, decentralized payment proxies, multi-chain gas sponsorship, and yield-bearing collateral pools where your idle subscription funds earn interest.",
    badge: "WHAT'S NEXT",
    stat: "Mainnet Ready",
    statLabel: "Upcoming support for actual live Mastercard links and cross-chain execution rails",
    colorTheme: "from-indigo-600 to-purple-500 font-extrabold uppercase",
    bgAccent: "bg-indigo-50/50 border-indigo-100",
    bulletPoints: [
      "Instant virtual card generation for granular subscription locking",
      "Earn on-chain yields on capital reserved for future bills",
      "Completely sponsored gasless transactions via Arc's Account Abstraction"
    ]
  }
];

export const Welcome: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSignIn = async (useRedirect = false) => {
    setAuthError(null);
    try {
      if (useRedirect) {
        await signInWithGoogleRedirect();
      } else {
        await signInWithGoogle();
      }
    } catch (error: any) {
      console.error('Auth error details:', error);
      const errCode = error?.code || '';
      
      if (errCode === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed. Please try again or use the redirect fallback method.');
      } else if (errCode === 'auth/popup-blocked') {
        setAuthError('Popups are blocked by your browser. Please allow them or click the "Sign In (Redirect Fallback)" button.');
      } else if (errCode === 'auth/unauthorized-domain') {
        setAuthError(`This domain "${window.location.hostname}" is not authorized in your Firebase Project. To fix this, log in to your Firebase Console, navigate to "Authentication" -> "Settings" -> "Authorized Domains", and add "${window.location.hostname}" to the list.`);
      } else if (errCode === 'auth/operation-not-allowed') {
        setAuthError('Google Sign-In is not enabled. Go to Firebase Console -> Authentication -> Sign-In Method and enable the Google login provider.');
      } else {
        setAuthError(`Authentication failed (${errCode || 'Error'}). If you just deployed on Vercel, please make sure you have: 1. Enabled the Google Sign-In provider in your Firebase Console. 2. Added "${window.location.hostname}" to "Authorized Domains" under Authentication Settings inside the Firebase Console.`);
      }
    }
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % PITCH_SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length);
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 flex-1 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-16 w-full"
        >
          {/* Main Horizontal Hero & Pitch Deck Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
              <div className="inline-flex">
                <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-md shadow-blue-500/20 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Now Live on <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 font-extrabold">Arc Testnet</span>
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Manage All Subscriptions <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block mt-1">USDC & Mastercard.</span>
              </h1>

              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
                SubZero helps you seamlessly monitor, pause, and optimize recurring subscriptions spanning both Web3 USDC flows and traditional Mastercard payments in one unified dashboard, <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700">powered by Arc Network</span>.
              </p>

              <div className="space-y-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                  <button 
                    onClick={() => handleSignIn(false)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-yellow-400 text-black font-black rounded-full hover:bg-yellow-300 transition-all group shadow-xl shadow-yellow-500/20 uppercase tracking-widest text-xs cursor-pointer"
                  >
                    Get Started with Google (Email)
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform cursor-pointer" />
                  </button>
                </div>

                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-3 text-red-500 text-sm max-w-xl mx-auto lg:mx-0 text-left shadow-lg"
                  >
                    <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                    <div>
                      <p className="font-bold">Authentication Diagnostic Guide</p>
                      <p className="text-xs leading-relaxed mt-1">{authError}</p>
                    </div>
                  </motion.div>
                )}

                <p className="text-xs text-slate-500 font-medium">
                  Make sure to allow popups in your browser settings.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Pitch Deck */}
            <div className="lg:col-span-7 w-full">
              <div className="bg-slate-900 text-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 relative">
                
                {/* Abs-top decorative bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-yellow-400 w-full" />
                
                <div className="p-6 md:p-10">
                  {/* Header of Deck */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400 flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        Interactive Product Pitch Deck
                      </span>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-white">How SubZero Works</h2>
                    </div>
                    
                    {/* Slide Tabs Navigation */}
                    <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-stretch sm:self-auto justify-between">
                      <button 
                        onClick={prevSlide}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        title="Previous Slide"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-1.5 px-3">
                        {PITCH_SLIDES.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSlide(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === idx ? 'bg-yellow-400 w-6' : 'bg-slate-700 hover:bg-slate-500'}`}
                          />
                        ))}
                      </div>

                      <button 
                        onClick={nextSlide}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        title="Next Slide"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Dynamic Slide Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start min-h-[280px]"
                    >
                      {/* Slide Narrative Left */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="space-y-1.5">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${PITCH_SLIDES[activeSlide].colorTheme} bg-slate-800 border border-slate-800`}>
                            {PITCH_SLIDES[activeSlide].badge}
                          </span>
                          <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                            {PITCH_SLIDES[activeSlide].title}
                          </h3>
                          <p className="text-xs font-bold text-yellow-400 tracking-wide">
                            {PITCH_SLIDES[activeSlide].subtitle}
                          </p>
                        </div>

                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                          {PITCH_SLIDES[activeSlide].description}
                        </p>

                        {/* Bullet list of advantages */}
                        <ul className="space-y-1.5 pt-1">
                          {PITCH_SLIDES[activeSlide].bulletPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-[11px] md:text-xs text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1 shrink-0 animate-pulse" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Slide Graphic Right */}
                      <div className="md:col-span-5 flex flex-col justify-between self-stretch bg-slate-950/70 border border-slate-800/80 rounded-3xl p-5 space-y-6 relative">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Metric Analytics</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${PITCH_SLIDES[activeSlide].colorTheme} tracking-tight`}>
                              {PITCH_SLIDES[activeSlide].stat}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                              {PITCH_SLIDES[activeSlide].statLabel}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/50 flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 font-bold">Interactive Navigation</p>
                            <p className="text-[10px] text-slate-200">Slide {activeSlide + 1} of {PITCH_SLIDES.length}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Deck Footer Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-6 mt-6 gap-4 text-xs text-slate-500">
                    <span className="font-mono text-[9px] text-slate-500">SubZero Pitch Deck v1.2</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {PITCH_SLIDES.map((slide, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setActiveSlide(sIdx)}
                          className={`px-2 py-1 rounded-md border font-bold text-[8px] uppercase transition-all cursor-pointer ${activeSlide === sIdx ? 'bg-white text-slate-900 border-white font-extrabold shadow-sm' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}`}
                        >
                          {slide.tag.replace("The ", "")}
                        </button>
                      ))}
                    </div>
                    <span className="font-mono text-[10px] bg-slate-950 px-2 py-1 border border-slate-800 rounded">{String(activeSlide + 1).padStart(2, '0')} / {String(PITCH_SLIDES.length).padStart(2, '0')}</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-12" />

          {/* Features Bento */}
          <div className="space-y-4">
            <div className="text-center md:text-left space-y-1 max-w-2xl">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.25rem]">Core Architecture</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 animate-pulse">Platform Features At A Glance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Globe className="w-6 h-6 text-blue-500" />}
                title="Arc Network"
                description="Native support for Arc Testnet stablecoin workflows."
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6 text-yellow-500" />}
                title="Smart Limits"
                description="Set spending caps and get notified before renewals."
              />
              <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-slate-500" />}
                title="Budget Insights"
                description="Visualize where your money goes every month."
              />
              <FeatureCard 
                icon={<CreditCard className="w-6 h-6 text-emerald-500" />}
                title="Subscription Control"
                description="Instantly toggle, pause, or terminate recurring USDC flows."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-6 h-6 text-indigo-500" />}
                title="Secure Vault"
                description="Safe email-authenticated database storing key billing parameters."
              />
              <FeatureCard 
                icon={<AlertCircle className="w-6 h-6 text-rose-500" />}
                title="Real-time Simulation"
                description="Claim USDC testnet credits and track transactions on an live interface."
              />
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left hover:border-yellow-200 transition-colors group">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors text-slate-900">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

