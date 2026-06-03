import React, { useState, useEffect } from 'react';
import { Waves, MapPin, BookOpen, Moon, CloudLightning, Shield } from 'lucide-react';

export default function TacticalHUD({ activeModule, setActiveModule }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'vault', label: 'Vault', icon: Shield },
    { id: 'meteo', label: 'Meteo', icon: CloudLightning },
    { id: 'marine', label: 'Marine', icon: Waves },
    { id: 'spots', label: 'Spots', icon: MapPin },
    { id: 'log', label: 'Log', icon: BookOpen },
    { id: 'solunar', label: 'Solunar', icon: Moon },
  ];

  const handleNavClick = (id) => {
    if (activeModule === id) {
      setActiveModule(null);
    } else {
      setActiveModule(id);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-[120] bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-850 shadow-[0_-12px_40px_rgba(0,0,0,0.7)]">
      <div className="w-full flex justify-around items-center px-2 py-3 pb-6 md:pb-4 transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-mono text-[0.6rem] md:text-[0.65rem] font-bold tracking-widest uppercase transition-all duration-300 relative ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'text-zinc-500 hover:text-slate-100 hover:bg-zinc-900/50 border border-transparent'
              }`}
              aria-label={`Toggle ${item.label} Module`}
            >
              <Icon size={13} className={isActive ? 'animate-pulse' : ''} />
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
