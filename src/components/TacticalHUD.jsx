import React, { useState, useEffect } from 'react';
import { Waves, MapPin, BookOpen, Moon } from 'lucide-react';

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
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[120]">
      {/* Network Telemetry Indicator */}
      <div className={`absolute top-[-26px] right-3 text-[0.55rem] tracking-widest font-mono border px-2 py-0.5 rounded-sm bg-zinc-950/90 backdrop-blur whitespace-nowrap shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${
        isOnline 
          ? 'text-emerald-400 border-emerald-500/30' 
          : 'text-amber-400 border-amber-500/30 animate-pulse'
      }`}>
        {isOnline ? '[ 📡 ONLINE ]' : '[ 💾 LOCAL SHELL ]'}
      </div>

      <div className="flex items-center gap-1 bg-zinc-950/80 backdrop-blur-xl border border-zinc-850 px-3 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.7)] hover:border-zinc-700/40 transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[0.65rem] font-bold tracking-widest uppercase transition-all duration-300 relative ${
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
