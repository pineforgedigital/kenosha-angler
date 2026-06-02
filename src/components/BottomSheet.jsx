import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import MarineDashboard from './MarineDashboard';
import CatchLog from './CatchLog';
import SpotGuide from './SpotGuide';
import SolunarDashboard from './SolunarDashboard';
import MeteorologyHub from './MeteorologyHub';
import ComplianceVault from './ComplianceVault';

export default function BottomSheet({ activeModule, setActiveModule, activeLocation, setActiveLocation }) {
  const dragControls = useDragControls();

  const getPlaceholderText = () => {
    switch (activeModule) {
      case 'marine':
        return 'MARINE DASHBOARD INITIALIZING...';
      case 'vault':
        return 'COMPLIANCE VAULT INITIALIZING...';
      case 'meteo':
        return 'METEOROLOGY HUB INITIALIZING...';
      case 'spots':
        return 'SPOTS DIRECTORY INITIALIZING...';
      case 'log':
        return 'CATCH LOGBOOK INITIALIZING...';
      case 'solunar':
        return 'SOLUNAR CALCULATIONS INITIALIZING...';
      default:
        return 'INITIALIZING...';
    }
  };

  return (
    <AnimatePresence>
      {activeModule && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 9999 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={(event, info) => {
            if (info.offset.y > 300 || info.velocity.y > 800) {
              setActiveModule(null);
            }
          }}
          className="h-[92vh] w-full fixed bottom-0 left-0 right-0 z-[100] bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-850 rounded-t-2xl shadow-[0_-12px_45px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
        >
          {/* Sticky Header & Drag zone */}
          <div 
            className="sticky top-0 z-[110] bg-zinc-950/95 backdrop-blur-md pt-4 pb-2 px-6 flex items-center justify-between border-b border-zinc-900 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            {/* Status Indicator */}
            <div className="flex items-center gap-2 pointer-events-none w-1/4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />
              <span className="text-zinc-500 font-mono text-[0.6rem] tracking-[0.15em] uppercase">
                {activeModule}
              </span>
            </div>

            {/* Centered Drag Handle */}
            <div className="flex-1 flex justify-center pointer-events-none">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full opacity-60" />
            </div>

            {/* Close Button */}
            <div className="w-1/4 flex justify-end">
              <button
                onClick={() => setActiveModule(null)}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-zinc-400 hover:text-red-400 p-1 rounded-sm border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer"
                aria-label="Close sheet"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Sheet Content */}
          <div className="flex-1 overflow-y-auto font-mono pb-32">
            {activeModule === 'vault' ? (
              <ComplianceVault />
            ) : activeModule === 'marine' ? (
              <MarineDashboard activeLocation={activeLocation} />
            ) : activeModule === 'meteo' ? (
              <MeteorologyHub activeLocation={activeLocation} setActiveLocation={setActiveLocation} />
            ) : activeModule === 'log' ? (
              <CatchLog activeLocation={activeLocation} />
            ) : activeModule === 'spots' ? (
              <SpotGuide setActiveLocation={setActiveLocation} setActiveModule={setActiveModule} />
            ) : activeModule === 'solunar' ? (
              <SolunarDashboard />
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center">
                <div className="text-zinc-400 text-sm tracking-wider animate-pulse">
                  {getPlaceholderText()}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
