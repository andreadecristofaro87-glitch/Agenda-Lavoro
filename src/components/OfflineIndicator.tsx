import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => setShowReconnectedToast(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-800/95 text-white px-3.5 py-1.5 text-xs font-bold shadow-lg backdrop-blur-xs border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
        <WifiOff className="w-3.5 h-3.5 text-amber-300" />
        <span>Modalità Offline attiva • Dati e calcoli salvati sul telefono</span>
      </div>
    );
  }

  if (showReconnectedToast) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-600/95 text-white px-3.5 py-1.5 text-xs font-bold shadow-lg backdrop-blur-xs border border-emerald-400 animate-in fade-in slide-in-from-top-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        <span>Connessione ripristinata</span>
      </div>
    );
  }

  return null;
};
