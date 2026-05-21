import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import AtmosphereDashboard from './components/AtmosphereDashboard';
import RadarMap from './components/RadarMap';
import TacticalHUD from './components/TacticalHUD';
import BottomSheet from './components/BottomSheet';
import lakeDirectory from './data/lakeDirectory.json';

function App() {
  const [activeLocation, setActiveLocation] = useState(lakeDirectory[0]);
  const [squallAlert, setSquallAlert] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    document.title = activeLocation 
      ? `Kenosha Angler | ${activeLocation.name.toUpperCase()}` 
      : 'Kenosha Angler // Tactical HUD';
  }, [activeLocation]);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-zinc-950 text-slate-50 flex flex-col scanlines">
      {/* Top Header Bar */}
      <header className="w-[95%] max-w-[500px] mx-auto bg-zinc-950 border-b border-zinc-900/80 px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+12px)] flex items-center justify-between z-50 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
            <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-slate-200 uppercase font-sans">
              KENOSHA ANGLER <span className="text-emerald-400">//</span> HUD
            </h1>
            <p className="text-[0.55rem] text-zinc-500 tracking-wider">TACTICAL WEATHER & LAKE TELEMETRY</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-zinc-500 text-[0.55rem] tracking-wider">SYSTEM STATUS</div>
          <div className="text-emerald-400 text-[0.6rem] font-bold tracking-widest uppercase animate-pulse">SENSORS ONLINE</div>
        </div>
      </header>

      <div className="flex-grow flex flex-col overflow-hidden relative">
        <div className="bg-zinc-900 border-b border-zinc-800 flex flex-col relative shrink-0">
          <SearchPanel activeLocation={activeLocation} setActiveLocation={setActiveLocation} />
          <AtmosphereDashboard activeLocation={activeLocation} squallAlert={squallAlert} setSquallAlert={setSquallAlert} />
        </div>
        <div className="flex-1 relative">
          {squallAlert && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white font-mono text-[0.65rem] py-2 px-4 flex items-center justify-center gap-2 animate-pulse z-[90] font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(220,38,38,0.4)] border-b border-red-800">
              <AlertTriangle size={13} className="shrink-0" />
              <span>EMERGENCY OVERRIDE: {squallAlert.properties.event.toUpperCase()} IN EFFECT IN SECTOR</span>
            </div>
          )}
          <RadarMap activeLocation={activeLocation} squallAlert={squallAlert} />
          <div className="absolute bottom-3.5 left-4 z-[90] text-[0.5rem] md:text-[0.55rem] tracking-[0.18em] text-zinc-500 font-mono select-none pointer-events-none uppercase bg-zinc-950/70 backdrop-blur-sm border border-zinc-900 px-2 py-0.5 rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            DESIGNED & BUILT BY PINE FORGE DIGITAL LLC
          </div>
          <TacticalHUD activeModule={activeModule} setActiveModule={setActiveModule} />
          <BottomSheet 
            activeModule={activeModule} 
            setActiveModule={setActiveModule} 
            activeLocation={activeLocation} 
            setActiveLocation={setActiveLocation} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
