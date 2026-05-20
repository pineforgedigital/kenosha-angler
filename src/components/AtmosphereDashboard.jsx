import React, { useEffect, useState } from 'react';
import { fetchLakeWeather, calculateBiteScore, determineTargetSpecies, determineLureTactics, fetchNWSAlerts } from '../services/weatherEngine';
import { Thermometer, Wind, Gauge, Cloud, Crosshair, Anchor, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AtmosphereDashboard({ activeLocation, squallAlert, setSquallAlert }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!activeLocation) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchLakeWeather(activeLocation.lat, activeLocation.lon),
      fetchNWSAlerts(activeLocation.lat, activeLocation.lon)
    ])
      .then(([weather, alertData]) => {
        if (isMounted) {
          const biteScoreData = calculateBiteScore(weather);
          const speciesData = determineTargetSpecies(weather, biteScoreData);
          const lureData = determineLureTactics(speciesData, weather);
          setData({ weather, biteScoreData, speciesData, lureData });
          setSquallAlert(alertData);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeLocation]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-zinc-900 border-b border-zinc-800 p-4 grid grid-cols-12 gap-4 overflow-hidden animate-pulse h-[180px]">
        {/* Left Side Skeleton */}
        <div className="col-span-5 flex flex-col justify-center border-r border-zinc-800/50 pr-4">
          <div className="bg-zinc-850 rounded h-3 w-1/3 mb-2" />
          <div className="bg-zinc-850 rounded h-8 w-3/4 mb-2" />
          <div className="bg-zinc-850 rounded h-3 w-1/2" />
        </div>
        
        {/* Right Side Skeleton */}
        <div className="col-span-7 flex flex-col justify-between pl-2">
          {/* Top row */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-950/60 border border-zinc-855/50 p-2 rounded flex flex-col items-center">
                <div className="bg-zinc-850 rounded h-4 w-4 mb-2" />
                <div className="bg-zinc-850 rounded h-2 w-8 mb-1" />
                <div className="bg-zinc-850 rounded h-3 w-10" />
              </div>
            ))}
          </div>
          {/* Bottom row */}
          <div className="bg-zinc-950/60 border border-zinc-855/50 p-2 rounded flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <div className="bg-zinc-850 rounded-full h-6 w-6" />
              <div className="flex-grow">
                <div className="bg-zinc-850 rounded h-3 w-1/4 mb-1.5" />
                <div className="bg-zinc-850 rounded h-2.5 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex-1 flex items-center justify-center text-red-500 font-mono text-sm bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 h-[180px]">
        SENSOR FAILURE: {error}
      </div>
    );
  }

  if (!data) return null;

  const { weather, biteScoreData, speciesData, lureData } = data;
  const pressureInHg = (weather.main.pressure / 33.8639).toFixed(2);

  // Tactical UI Override for Squall Mode
  const isSquall = squallAlert !== null;
  const containerClasses = isSquall
    ? "flex-grow bg-red-950/80 backdrop-blur-xl border-t border-red-800/60 p-4 grid grid-cols-12 gap-4 overflow-hidden relative glow-red"
    : "flex-grow bg-zinc-950/50 backdrop-blur-xl border-t border-zinc-850 p-4 grid grid-cols-12 gap-4 overflow-hidden relative";

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={activeLocation.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className={containerClasses}
      >
        {/* Subtle CRT Noise overlay using radial gradient for glassmorphism */}
        <div className={`absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isSquall ? 'from-transparent via-red-950/30 to-red-950/80' : 'from-transparent via-zinc-950/20 to-zinc-950/80'} z-0`}></div>

        {/* Left Side: Score & Target (Col span 5) */}
        <div className={`col-span-5 flex flex-col justify-center border-r ${isSquall ? 'border-red-950 pr-4' : 'border-zinc-850 pr-4'} z-10`}>
          {isSquall ? (
             <div className="flex flex-col justify-center h-full">
               <motion.div 
                 initial={{ scale: 0.8 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", stiffness: 200, damping: 10 }}
                 className="flex items-center gap-2 text-red-500 mb-1"
               >
                 <AlertTriangle size={24} className="animate-ping absolute opacity-75" />
                 <AlertTriangle size={24} className="relative" />
                 <div className="text-2xl font-black tracking-tighter uppercase font-sans">TAKE COVER</div>
               </motion.div>
               <div className="font-mono text-[0.6rem] uppercase tracking-widest text-red-300 mt-2 line-clamp-2 leading-tight">
                 {squallAlert.properties.headline}
               </div>
             </div>
          ) : (
            <div className="flex flex-col justify-center">
              <div className="text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-zinc-650 rounded-full" />
                <span>BITE FORECAST INDEX</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.div 
                  initial={{ scale: 0.8, filter: 'blur(4px)' }}
                  animate={{ scale: 1, filter: 'blur(0px)' }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl font-black tracking-tighter font-mono ${biteScoreData.status.color} ${biteScoreData.status.color.includes('emerald') ? 'border-emerald-500/30 bg-emerald-500/5 glow-emerald' : biteScoreData.status.color.includes('amber') ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-zinc-800 bg-zinc-900/50'}`}
                >
                  {biteScoreData.score}
                </motion.div>
                <div>
                  <div className={`font-mono text-xs font-extrabold uppercase tracking-widest ${biteScoreData.status.color}`}>
                    {biteScoreData.status.text}
                  </div>
                  <div className="text-zinc-500 font-mono text-[0.55rem] uppercase tracking-wider mt-0.5">
                    SOLAR-BARO RATIO: {Math.max(1, (biteScoreData.score * 1.25).toFixed(1))}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                  <span>TARGET OPPORTUNITY</span>
                </div>
                <div className={`font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${speciesData.color}`}>
                  <Crosshair size={12} className="animate-spin-slow" /> <span>{speciesData.species}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Lure Matrix OR Squall Details (Col span 4) */}
        <div className={`col-span-4 flex flex-col justify-center border-r ${isSquall ? 'border-red-950 pr-4' : 'border-zinc-850 pr-4'} z-10`}>
          {isSquall ? (
            <div className="h-full overflow-y-auto pr-2 scrollbar-hide">
              <div className="text-red-400 font-mono text-[0.6rem] mb-1 tracking-widest uppercase font-bold">CRITICAL BULLETIN</div>
              <div className="text-red-200 font-mono text-[0.6rem] leading-normal mb-2">
                {squallAlert.properties.description || "Severe weather approaching. Seek shelter."}
              </div>
              {squallAlert.properties.instruction && (
                <>
                  <div className="text-red-400 font-mono text-[0.6rem] mb-1 tracking-widest uppercase font-bold">ACTION REQUIRED</div>
                  <div className="text-red-200 font-mono text-[0.6rem] leading-normal">
                    {squallAlert.properties.instruction}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <div className="text-zinc-500 font-mono text-[0.6rem] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-zinc-650 rounded-full" />
                <span>TACTICAL LOADOUT</span>
              </div>
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-950/80 border-zinc-850 p-2 rounded-sm border mb-2 relative group hover:border-zinc-700/50 transition-all duration-300"
              >
                <div className="text-emerald-400 font-mono text-[0.55rem] mb-0.5 tracking-widest uppercase font-bold">RECOMMENDED LURE</div>
                <div className="text-slate-100 font-mono text-[0.68rem] leading-tight font-medium uppercase">{lureData.lure}</div>
              </motion.div>
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 text-zinc-400 font-mono text-[0.6rem] uppercase tracking-widest"
              >
                <Anchor size={11} className="text-emerald-400" /> <span>ZONE: {lureData.depth}</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Side: Metrics Grid (Col span 3) */}
        <div className="col-span-3 grid grid-cols-1 gap-1.5 content-center z-10 min-w-[185px] md:min-w-[260px]">
          {/* Temperature */}
          <div className={`flex items-center justify-between ${isSquall ? 'bg-red-950/30 border-red-900/50' : 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-700/50'} px-2 py-1 border rounded-sm transition-colors duration-200`}>
            <div className="flex items-center gap-1">
              <Thermometer size={11} className={isSquall ? 'text-red-400' : 'text-zinc-500'} />
              <span className="text-zinc-550 font-mono text-[0.52rem] tracking-tighter uppercase font-semibold">TEMPERATURE</span>
            </div>
            <span className="text-slate-200 font-mono text-[0.65rem] font-bold">{Math.round(weather.main.temp)}°F</span>
          </div>
          
          {/* Wind Velocity */}
          <div className={`flex items-center justify-between ${isSquall ? 'bg-red-950/30 border-red-900/50' : 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-700/50'} px-2 py-1 border rounded-sm transition-colors duration-200`}>
            <div className="flex items-center gap-1">
              <Wind size={11} className={isSquall ? 'text-red-400' : 'text-zinc-500'} />
              <span className="text-zinc-550 font-mono text-[0.52rem] tracking-tighter uppercase font-semibold">WIND VELOCITY</span>
            </div>
            <span className="text-slate-200 font-mono text-[0.65rem] font-bold">{Math.round(weather.wind.speed)} MPH</span>
          </div>

          {/* Barometer */}
          <div className={`flex items-center justify-between ${isSquall ? 'bg-red-950/30 border-red-900/50' : 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-700/50'} px-2 py-1 border rounded-sm transition-colors duration-200`}>
            <div className="flex items-center gap-1">
              <Gauge size={11} className={isSquall ? 'text-red-400' : 'text-zinc-500'} />
              <span className="text-zinc-550 font-mono text-[0.52rem] tracking-tighter uppercase font-semibold">BAROMETER</span>
            </div>
            <span className="text-slate-200 font-mono text-[0.65rem] font-bold">{pressureInHg} IN</span>
          </div>

          {/* Cloud Cover */}
          <div className={`flex items-center justify-between ${isSquall ? 'bg-red-950/30 border-red-900/50' : 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-700/50'} px-2 py-1 border rounded-sm transition-colors duration-200`}>
            <div className="flex items-center gap-1">
              <Cloud size={11} className={isSquall ? 'text-red-400' : 'text-zinc-500'} />
              <span className="text-zinc-550 font-mono text-[0.52rem] tracking-tighter uppercase font-semibold">CLOUD COVER</span>
            </div>
            <span className="text-slate-200 font-mono text-[0.65rem] font-bold">{weather.clouds.all}%</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
