/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { Welcome } from './components/Welcome';
import { Dashboard } from './components/Dashboard';
import { Web3Provider } from './components/Web3Provider';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-slate-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-yellow-400 animate-spin"></div>
          <p className="text-slate-500 font-medium">Initializing SubZero...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Welcome />;
}

export default function App() {
  return (
    <FirebaseProvider>
      <Web3Provider>
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-500/30">
          <AppContent />
        </div>
      </Web3Provider>
    </FirebaseProvider>
  );
}

