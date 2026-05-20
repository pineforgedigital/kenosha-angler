import React from 'react';
import lakeDirectory from '../data/lakeDirectory.json';
import { Target } from 'lucide-react';

export default function SpotGuide({ setActiveLocation, setActiveModule }) {
  // Step 2: Categorization Logic
  const greatLakes = lakeDirectory.filter(
    (lake) => lake.id.includes('harbor') || lake.id.includes('lake-michigan')
  );
  
  const rivers = lakeDirectory.filter(
    (lake) => lake.id.includes('river')
  );
  
  const inlandLakes = lakeDirectory.filter(
    (lake) =>
      !lake.id.includes('harbor') &&
      !lake.id.includes('lake-michigan') &&
      !lake.id.includes('river')
  );

  const categories = [
    { title: 'Great Lakes / Harbor Marine', spots: greatLakes },
    { title: 'River Basins & Access Points', spots: rivers },
    { title: 'Inland Lakes & Reservoirs', spots: inlandLakes },
  ];

  const handleLockSpot = (spot) => {
    setActiveLocation(spot);
    setActiveModule(null);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto text-slate-50 max-w-2xl mx-auto pb-28">
      {categories.map((cat) => {
        if (cat.spots.length === 0) return null;
        return (
          <div key={cat.title} className="mb-6">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm py-2.5 font-mono font-bold text-zinc-500 border-b border-zinc-850 uppercase tracking-widest text-[0.6rem] z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full" />
              <span>{cat.title}</span>
            </div>

            {/* Spot Cards */}
            <div className="flex flex-col">
              {cat.spots.map((spot) => (
                <div
                  key={spot.id}
                  className="flex justify-between items-center py-3 border-b border-zinc-900/40 hover:bg-zinc-950/40 transition-all duration-200 px-2 group"
                >
                  <span className="text-xs font-mono font-semibold text-slate-300 tracking-wide group-hover:text-slate-100 transition-colors">
                    &gt; {spot.name.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => handleLockSpot(spot)}
                    className="text-[0.65rem] font-bold font-mono text-emerald-450 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-sm flex items-center gap-1.5 hover:bg-emerald-550 hover:text-zinc-950 hover:border-emerald-400 transition-all duration-300 cursor-pointer active:scale-95"
                    aria-label={`Lock location to ${spot.name}`}
                  >
                    <Target size={11} className="group-hover:rotate-45 transition-transform duration-500" />
                    <span>[ LOCK ]</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
