import React, { useState, useEffect } from 'react';
import { Waves, Wind, AlertTriangle } from 'lucide-react';
import { fetchLakeWeather, calculateWaveHeight, checkSmallCraftAdvisory, calculatePierSafety, calculateUpwellingDepth } from '../services/weatherEngine';

const Lighthouse = ({ className, size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.5 2h5" />
    <path d="M12 2v3" />
    <path d="M8 22h8" />
    <path d="M10 8h4" />
    <path d="M9 12h6" />
    <path d="M8 16h8" />
    <path d="M9.5 5h5l2.5 17H7l2.5-17Z" />
    <path d="M12 8v4" />
    <path d="M8 5h8" />
  </svg>
);

export default function MarineDashboard({ activeLocation }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!activeLocation) return;

    setLoading(true);
    setError(null);

    fetchLakeWeather(activeLocation.lat, activeLocation.lon)
      .then((data) => {
        if (isMounted) {
          setWeatherData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeLocation]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center font-mono text-xs text-emerald-500 py-12">
        <span className="animate-pulse">SCANNING MARINE FREQUENCY...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center font-mono text-xs text-red-500 py-12">
        ERROR FETCHING MARINE TELEMETRY: {error}
      </div>
    );
  }

  if (!weatherData) return null;

  const windSpeed = weatherData.wind?.speed || 0;
  const windDegree = weatherData.wind?.deg || 0;
  const waveHeight = calculateWaveHeight(windSpeed, windDegree);
  const isAdvisory = checkSmallCraftAdvisory(windSpeed, waveHeight);
  const pierStatus = calculatePierSafety(windSpeed, windDegree);
  const upwelling = calculateUpwellingDepth(windSpeed, windDegree, new Date().getMonth());

  // Direction helper for wind
  const getWindDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const val = Math.floor((deg / 22.5) + 0.5);
    return directions[val % 16];
  };

  const targetMin = Math.max(10, upwelling.thermocline - 5);
  const targetMax = upwelling.thermocline + 5;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 text-slate-50 flex flex-col gap-6 pb-28">
      {/* Top Section (The Warning Banner) */}
      {isAdvisory && (
        <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 text-red-400 p-4 rounded-lg animate-pulse">
          <AlertTriangle size={20} className="shrink-0" />
          <div className="font-mono text-xs font-bold tracking-wider uppercase">
            SMALL CRAFT ADVISORY: DANGEROUS FETCH CONDITIONS
          </div>
        </div>
      )}

      {/* PIER SAFETY MODULE */}
      <div className={`border ${pierStatus.border} ${pierStatus.bg} p-4 mb-2 flex items-center justify-between rounded-lg backdrop-blur-md relative overflow-hidden transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] pointer-events-none" />
        <div className="flex flex-col z-10">
          <span className="text-zinc-500 text-[0.6rem] font-mono tracking-widest uppercase font-bold flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
            <span>KENOSHA NORTH PIER STATUS</span>
          </span>
          <span className={`text-md md:text-lg font-mono font-bold ${pierStatus.color} ${pierStatus.status.includes("CRITICAL") ? 'animate-pulse' : ''}`}>
            {pierStatus.status}
          </span>
        </div>
        <Lighthouse className={`${pierStatus.color} z-10`} size={26} />
      </div>

      {/* Middle Section (The Data Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Block: Wave Height */}
        <div className="bg-zinc-950/70 border border-zinc-850 p-6 rounded-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[50px] pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest font-bold">EST. WAVE HEIGHT</span>
            <Waves className="text-blue-400 group-hover:animate-bounce transition-all" size={18} />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-mono font-bold tracking-tighter text-blue-450 font-black">
              {waveHeight}
            </span>
            <span className="text-xs font-mono text-zinc-400 font-bold tracking-widest">FT</span>
          </div>
          <div className="mt-3 text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest leading-normal">
            {windDegree > 0 && windDegree < 180 
              ? '// onshore winds driving strong swell fetch' 
              : '// offshore winds generating sheltered calm'}
          </div>
        </div>

        {/* Right Block: Wind Vector */}
        <div className="bg-zinc-950/70 border border-zinc-850 p-6 rounded-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[50px] pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest font-bold">WIND VECTOR</span>
            <Wind className="text-emerald-400 group-hover:rotate-12 transition-transform duration-300" size={18} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-mono font-bold tracking-tighter text-slate-100 font-black">
              {Math.round(windSpeed)}
            </span>
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">MPH</span>
            <span className="text-md font-mono text-emerald-450 font-bold ml-2">
              {getWindDirection(windDegree)}
            </span>
            <span className="text-[0.65rem] font-mono text-zinc-650">({windDegree}°)</span>
          </div>
          <div className="mt-3 text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest leading-normal">
            // TELEMETRY SNAP SHORE STATION DATA
          </div>
        </div>
      </div>

      {/* THERMAL UPWELLING PROFILE */}
      <div className="bg-zinc-950/90 border border-cyan-950 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden glow-cyan">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] pointer-events-none" />
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[0.65rem] uppercase tracking-[0.15em] font-bold">
            <span className="w-1.5 h-1.5 bg-cyan-450 rounded-full animate-ping" />
            <span>THERMAL UPWELLING PROFILE</span>
          </div>
          <p className="text-zinc-450 text-[0.65rem] font-mono leading-relaxed max-w-xl">
            {upwelling.status.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-cyan-950/50 pt-3 md:pt-0 md:pl-6 shrink-0 z-10">
          <div className="flex flex-col">
            <span className="text-[0.55rem] font-mono text-zinc-500 uppercase tracking-widest">THERMOCLINE</span>
            <span className="text-xl font-mono font-bold text-cyan-400">{upwelling.thermocline} FT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.55rem] font-mono text-zinc-500 uppercase tracking-widest">TARGET ZONE</span>
            <span className="text-xs font-mono font-bold text-emerald-450 uppercase">
              {targetMin}FT - {targetMax}FT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
