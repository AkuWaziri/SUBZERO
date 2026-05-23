import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, Zap, ArrowRight, BarChart3, AlertCircle, Globe } from 'lucide-react';
import { signInWithGoogle, signInWithGoogleRedirect } from '../lib/firebase';
import { Brand } from './Brand';
import { Footer } from './Footer';

import { Navbar } from './Navbar';

export const Welcome: React.FC = () => {
  const [authError, setAuthError] = React.useState<string | null>(null);

  const handleSignIn = async (useRedirect = false) => {
    setAuthError(null);
    try {
      if (useRedirect) {
        await signInWithGoogleRedirect();
      } else {
        await signInWithGoogle();
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed. Please try again or use the redirect method if popups are blocked.');
      } else if (error.code === 'auth/popup-blocked') {
        setAuthError('Popups are blocked by your browser. Please allow them or use the redirect method.');
      } else {
        console.error('Auth error:', error);
        setAuthError('Authentication failed. Please try again.');
      }
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full text-center space-y-12 z-10 m-auto"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
          Manage Subscriptions <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-blue-600">on Arc.</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Tracking USDC payments on Arc Network shouldn't be a headache. SubZero helps you monitor, pause, and optimize your recurring subscriptions in one secure dashboard.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleSignIn(false)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-yellow-400 text-black font-black rounded-full hover:bg-yellow-300 transition-all group shadow-xl shadow-yellow-500/20 uppercase tracking-widest"
            >
              Get Started with Google
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 text-red-400 text-sm max-w-md mx-auto"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{authError}</p>
            </motion.div>
          )}

          <p className="text-xs text-slate-500 font-medium">
            Make sure to allow popups in your browser settings.
          </p>
        </div>

        {/* Features Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
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
        </div>
      </motion.div>
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
