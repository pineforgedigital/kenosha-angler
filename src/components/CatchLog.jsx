import React, { useState, useEffect } from 'react';
import { Fish, Ruler, Scale, Save, Trash2, FishOff } from 'lucide-react';
import { fetchLakeWeather } from '../services/weatherEngine';

export default function CatchLog({ activeLocation }) {
  // 1. catches: Initialize lazily from localStorage or default to empty array
  const [catches, setCatches] = useState(() => {
    const saved = localStorage.getItem('kenosha-catches');
    return saved ? JSON.parse(saved) : [];
  });

  // Form states
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [lure, setLure] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Effect: Sync catches to localStorage
  useEffect(() => {
    localStorage.setItem('kenosha-catches', JSON.stringify(catches));
  }, [catches]);

  // Save Catch Logic
  const handleSaveCatch = async (e) => {
    e.preventDefault();
    
    // Strict input validation
    if (!species.trim()) {
      setFormError("Species name is required.");
      return;
    }

    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      setFormError("Weight must be a valid number greater than 0.");
      return;
    }

    const numLength = parseFloat(length);
    if (isNaN(numLength) || numLength <= 0) {
      setFormError("Length must be a valid number greater than 0.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      // Get current atmospheric data
      const data = await fetchLakeWeather(activeLocation.lat, activeLocation.lon);
      const weatherData = {
        temp: data.main?.temp ? Math.round(data.main.temp) : 0,
        windSpeed: data.wind?.speed ? Math.round(data.wind.speed) : 0,
        pressure: data.main?.pressure ? (data.main.pressure / 33.8639).toFixed(2) : 0
      };

      // Construct new catch object
      const newCatch = {
        id: Date.now(),
        date: new Date().toISOString(),
        location: activeLocation.name,
        species,
        weight: `${numWeight} lbs`,
        length: `${numLength} in`,
        lure,
        weather: {
          temp: weatherData.temp,
          wind: weatherData.windSpeed,
          pressure: weatherData.pressure
        }
      };

      // Prepend to catches array
      setCatches((prevCatches) => [newCatch, ...prevCatches]);

      // Reset form
      setSpecies('');
      setWeight('');
      setLength('');
      setLure('');
    } catch (err) {
      console.error("Failed to snap weather. Logging with fallback.", err);
      // Fallback log without live weather
      const fallbackCatch = {
        id: Date.now(),
        date: new Date().toISOString(),
        location: activeLocation.name,
        species,
        weight: `${numWeight} lbs`,
        length: `${numLength} in`,
        lure,
        weather: {
          temp: 'N/A',
          wind: 'N/A',
          pressure: 'N/A'
        }
      };
      setCatches((prevCatches) => [fallbackCatch, ...prevCatches]);
      
      setSpecies('');
      setWeight('');
      setLength('');
      setLure('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCatch = (id) => {
    setCatches((prevCatches) => prevCatches.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto text-slate-100 max-w-2xl mx-auto pb-28">
      <div className="text-zinc-550 font-mono text-[0.6rem] tracking-widest uppercase mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span>LOG NEW CATCH AT {activeLocation?.name?.toUpperCase()}</span>
      </div>

      {/* Brutalist Form */}
      <form onSubmit={handleSaveCatch} className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
        <div className="relative flex items-center">
          <Fish size={13} className="absolute left-3 text-zinc-500" />
          <input
            type="text"
            required
            placeholder="SPECIES..."
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-850 text-slate-50 pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-sm placeholder-zinc-600"
          />
        </div>

        <div className="relative flex items-center">
          <Scale size={13} className="absolute left-3 text-zinc-500" />
          <input
            type="text"
            placeholder="WEIGHT (lbs)..."
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-850 text-slate-50 pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-sm placeholder-zinc-600"
          />
        </div>

        <div className="relative flex items-center col-span-2 md:col-span-1">
          <Ruler size={13} className="absolute left-3 text-zinc-500" />
          <input
            type="text"
            placeholder="LENGTH (in)..."
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-850 text-slate-50 pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-sm placeholder-zinc-600"
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <input
            type="text"
            placeholder="LURE / PRESENTATION..."
            value={lure}
            onChange={(e) => setLure(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-850 text-slate-50 px-3 py-2.5 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-sm placeholder-zinc-600"
          />
        </div>

        {formError && (
          <div className="col-span-2 text-red-400 text-[0.65rem] font-mono mt-1 mb-1 uppercase tracking-wider">
            [ ERROR // {formError.toUpperCase()} ]
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="col-span-2 bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-bold p-2.5 flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs uppercase tracking-widest rounded-sm shadow-[0_4px_12px_rgba(16,185,129,0.1)] active:scale-98"
        >
          <Save size={14} />
          <span>{isSaving ? 'SNAPPING TELEMETRY & SAVING...' : 'SECURE CATCH TO LOG'}</span>
        </button>
      </form>

      {/* Logbook History */}
      <div className="flex-1 flex flex-col">
        <div className="text-zinc-550 font-mono text-[0.6rem] tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
          <span>LOGGED ENTRIES ({catches.length})</span>
        </div>

        {catches.length === 0 ? (
          <div className="border border-dashed border-zinc-850 p-8 rounded-lg flex flex-col items-center justify-center text-zinc-600 text-center font-mono">
            <FishOff size={22} className="mb-2 stroke-1 text-zinc-600" />
            <span className="text-[0.65rem] uppercase tracking-wider">No catches recorded in local shell. Go hit the water!</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[30vh]">
            {catches.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950/70 border border-zinc-850 p-4 mb-3 flex flex-col rounded-lg relative group hover:border-zinc-700/60 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCatch(item.id)}
                  className="absolute right-3 top-3 text-zinc-600 hover:text-red-400 transition-colors p-1"
                  aria-label="Delete entry"
                >
                  <Trash2 size={13} />
                </button>

                {/* Top Row: Species & Location */}
                <div className="flex justify-between items-start pr-6 mb-2">
                  <span className="text-emerald-400 font-mono font-black uppercase text-xs tracking-wider">
                    {item.species}
                  </span>
                  <span className="text-zinc-550 font-mono text-[0.6rem] bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-sm">
                    {item.location.toUpperCase()}
                  </span>
                </div>

                {/* Middle Row: Weight, Length, Lure */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-zinc-900/60 text-zinc-350 font-mono text-[0.65rem] uppercase">
                  <div>
                    <span className="text-zinc-600 text-[0.55rem] block">WEIGHT</span>
                    <strong className="font-semibold text-slate-200">{item.weight || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-[0.55rem] block">LENGTH</span>
                    <strong className="font-semibold text-slate-200">{item.length || 'N/A'}</strong>
                  </div>
                  <div className="col-span-1">
                    <span className="text-zinc-600 text-[0.55rem] block">LURE</span>
                    <strong className="font-semibold text-slate-200 truncate block">{item.lure || 'N/A'}</strong>
                  </div>
                </div>

                {/* Bottom Row (The Weather Snap) */}
                <div className="bg-zinc-950/90 p-2 text-[0.65rem] font-mono text-zinc-450 mt-1 flex justify-between rounded border border-zinc-900/50">
                  <span>TEMP: <strong className="text-slate-350">{item.weather?.temp}°F</strong></span>
                  <span>WIND: <strong className="text-slate-350">{item.weather?.wind} MPH</strong></span>
                  <span>BARO: <strong className="text-slate-350">{item.weather?.pressure} IN</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
