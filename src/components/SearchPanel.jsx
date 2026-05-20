import React, { useState } from 'react';
import { Target, Search } from 'lucide-react';
import lakeDirectory from '../data/lakeDirectory.json';

export default function SearchPanel({ activeLocation, setActiveLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredLakes = lakeDirectory.filter(lake => 
    lake.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lake) => {
    setActiveLocation(lake);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="p-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-40 border-b border-zinc-800/40 bg-zinc-950/30">
      <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-xs tracking-widest uppercase bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-sm shrink-0">
        <Target size={14} className="text-emerald-400 animate-pulse" />
        <span>LOCK: <strong className="text-slate-100 font-bold">{activeLocation?.name || 'PENDING'}</strong></span>
      </div>

      <div className="relative flex-grow max-w-md w-full">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-zinc-500" />
          <input
            type="text"
            className="w-full bg-zinc-950/90 border border-zinc-800 text-slate-100 pl-9 pr-4 py-1.5 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono text-xs tracking-wider rounded-sm placeholder-zinc-600"
            placeholder="SEARCH SECTOR DIRECTORY..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {isOpen && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-zinc-950/95 border border-zinc-800 z-50 shadow-2xl rounded-sm backdrop-blur-lg">
            {filteredLakes.length > 0 ? (
              filteredLakes.map((lake) => (
                <button
                  key={lake.id}
                  className="w-full text-left px-4 py-2.5 border-b border-zinc-900 last:border-0 text-zinc-400 hover:bg-emerald-500/5 hover:text-emerald-400 transition-colors text-xs font-mono tracking-wide"
                  onClick={() => handleSelect(lake)}
                >
                  [ {lake.name.toUpperCase()} ]
                </button>
              ))
            ) : (
              <div className="px-4 py-2.5 text-zinc-600 text-xs font-mono uppercase tracking-widest">NO SIGNAL</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
