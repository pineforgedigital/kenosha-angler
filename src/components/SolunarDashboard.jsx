import React, { useState, useEffect } from 'react';
import { Moon, Sun, Star } from 'lucide-react';
import { calculateMoonPhase, calculateFeedWindows } from '../services/solunarEngine';

export default function SolunarDashboard() {
  const [solunarData, setSolunarData] = useState(null);

  useEffect(() => {
    const today = new Date();
    const phase = calculateMoonPhase(today);
    const windows = calculateFeedWindows(today);
    setSolunarData({ ...phase, windows });
  }, []);

  if (!solunarData) {
    return (
      <div className="flex-grow flex items-center justify-center font-mono text-xs text-emerald-500 py-12">
        <span className="animate-pulse">CALCULATING LUNAR CORRELATIONS...</span>
      </div>
    );
  }

  const { phaseName, illuminationPercentage, biteMultiplier, windows } = solunarData;

  // Star Rating Mapping
  // 1.5 -> 5 stars, 1.2 -> 4 stars, 1.0 -> 3 stars, 0.9 -> 2 stars
  const getStarRating = (mult) => {
    if (mult >= 1.5) return 5;
    if (mult >= 1.2) return 4;
    if (mult >= 1.0) return 3;
    return 2;
  };

  const starCount = getStarRating(biteMultiplier);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 text-slate-50 flex flex-col gap-6 pb-28">
      {/* Top Section (The Phase) */}
      <div className="bg-zinc-950/80 border border-purple-950 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[55px] pointer-events-none" />
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-zinc-550 font-mono text-[0.6rem] uppercase tracking-widest mb-1.5 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-550 rounded-full animate-pulse" />
              <span>LUNAR TELEMETRY</span>
            </span>
            <span className="text-2xl font-black tracking-tight text-purple-400 uppercase font-mono">
              {phaseName}
            </span>
            <span className="text-[0.65rem] font-mono text-zinc-450 mt-1">
              ILLUMINATION RATIO: <strong className="text-purple-300">{illuminationPercentage}%</strong>
            </span>
          </div>
          <Moon className="text-purple-400 animate-pulse" size={40} />
        </div>
      </div>

      {/* Middle Section (The Index) */}
      <div className="bg-zinc-950/60 border border-zinc-850 p-6 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <span className="text-zinc-550 font-mono text-[0.6rem] uppercase tracking-widest font-bold">SOLUNAR VIABILITY INDEX</span>
        <div className="flex gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              className={
                star <= starCount
                  ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]'
                  : 'text-zinc-800 fill-zinc-900'
              }
            />
          ))}
        </div>
        <span className="text-[0.65rem] font-mono text-zinc-450 uppercase tracking-widest">
          FEED INDEX MULTIPLIER: <strong className="text-emerald-400 font-extrabold">x{biteMultiplier.toFixed(1)}</strong>
        </span>
      </div>

      {/* Bottom Section (Feed Windows Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Major Feed Windows */}
        <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-xl hover:border-zinc-700/50 transition-colors">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5 mb-3.5">
            <Sun className="text-amber-500" size={15} />
            <span className="text-zinc-450 font-mono text-[0.6rem] uppercase tracking-widest font-bold">
              MAJOR FEED WINDOWS (PRIMARY)
            </span>
          </div>
          <div className="flex flex-col gap-2.5 font-mono text-[0.65rem] text-zinc-350">
            <div className="flex justify-between bg-zinc-950/90 p-2.5 border border-zinc-900/60 rounded-sm">
              <span className="text-zinc-500 font-medium">MAJOR 1 // TRANSIT OVERHEAD</span>
              <span className="text-emerald-450 font-black">{windows?.major1}</span>
            </div>
            <div className="flex justify-between bg-zinc-950/90 p-2.5 border border-zinc-900/60 rounded-sm">
              <span className="text-zinc-500 font-medium">MAJOR 2 // TRANSIT UNDERFOOT</span>
              <span className="text-emerald-450 font-black">{windows?.major2}</span>
            </div>
          </div>
        </div>

        {/* Minor Feed Windows */}
        <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-xl hover:border-zinc-700/50 transition-colors">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5 mb-3.5">
            <Moon className="text-purple-400" size={15} />
            <span className="text-zinc-450 font-mono text-[0.6rem] uppercase tracking-widest font-bold">
              MINOR FEED WINDOWS (SECONDARY)
            </span>
          </div>
          <div className="flex flex-col gap-2.5 font-mono text-[0.65rem] text-zinc-350">
            <div className="flex justify-between bg-zinc-950/90 p-2.5 border border-zinc-900/60 rounded-sm">
              <span className="text-zinc-500 font-medium">MINOR 1 // MOONRISE</span>
              <span className="text-yellow-500 font-black">{windows?.minor1}</span>
            </div>
            <div className="flex justify-between bg-zinc-950/90 p-2.5 border border-zinc-900/60 rounded-sm">
              <span className="text-zinc-500 font-medium">MINOR 2 // MOONSET</span>
              <span className="text-yellow-500 font-black">{windows?.minor2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
