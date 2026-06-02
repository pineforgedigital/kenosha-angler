import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, CloudRain, CloudLightning, CloudSnow, Sun, Cloud, CloudFog } from 'lucide-react';
import { geocodeSearch, fetchHourlyForecast } from '../services/weatherEngine';

const getWeatherIcon = (iconCode) => {
  if (!iconCode) return Cloud;
  if (iconCode.includes('01')) return Sun;
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return Cloud;
  if (iconCode.includes('09') || iconCode.includes('10')) return CloudRain;
  if (iconCode.includes('11')) return CloudLightning;
  if (iconCode.includes('13')) return CloudSnow;
  if (iconCode.includes('50')) return CloudFog;
  return Cloud;
};

export default function MeteorologyHub({ activeLocation, setActiveLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      if (!activeLocation) return;
      setIsLoadingForecast(true);
      const data = await fetchHourlyForecast(activeLocation.lat, activeLocation.lon);
      setForecast(data);
      setIsLoadingForecast(false);
    }
    loadForecast();
  }, [activeLocation]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const result = await geocodeSearch(searchQuery);
    setIsSearching(false);
    
    if (result) {
      setActiveLocation(result);
      setSearchQuery('');
    } else {
      alert("Location not found. Please try another ZIP or city.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-4">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-emerald-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ENTER ZIP OR CITY..."
          className="w-full bg-zinc-900 border border-zinc-800 text-slate-100 pl-10 pr-12 py-3 rounded-md focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono text-sm tracking-wider uppercase placeholder-zinc-600"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearching ? (
            <Loader2 size={16} className="text-emerald-400 animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          )}
        </div>
      </form>

      {/* Active Location Display */}
      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs tracking-widest uppercase mb-4">
        <MapPin size={14} className="text-emerald-400" />
        <span>TARGET: <strong className="text-slate-100 font-bold">{activeLocation?.name || 'PENDING'}</strong></span>
      </div>

      {/* 48-Hour Forecast Scroll */}
      <div className="flex-1">
        <h3 className="text-zinc-500 font-mono text-[0.65rem] tracking-[0.2em] mb-3 uppercase">48-Hour Telemetry</h3>
        
        {isLoadingForecast ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-emerald-500" size={24} />
          </div>
        ) : forecast.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 pb-4 snap-x tactical-scroll">
            {forecast.map((item, i) => {
              const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric' });
              const Icon = getWeatherIcon(item.icon);
              const popPct = Math.round((item.pop || 0) * 100);
              
              return (
                <div key={i} className="flex-shrink-0 snap-start bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 flex flex-col items-center justify-between min-w-[70px] h-[100px]">
                  <span className="text-zinc-400 text-[0.65rem] font-bold tracking-wider">{time}</span>
                  <Icon size={20} className="text-slate-200" />
                  <span className="text-slate-100 text-sm font-bold">{Math.round(item.temp)}°</span>
                  <span className={`text-[0.6rem] font-bold ${popPct > 0 ? 'text-blue-400' : 'text-zinc-600'}`}>
                    {popPct}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-zinc-500 text-xs font-mono">FORECAST DATA UNAVAILABLE</div>
        )}
      </div>
    </div>
  );
}
