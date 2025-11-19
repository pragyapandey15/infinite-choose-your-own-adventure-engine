import React from 'react';
import { GameState, WorldLocation } from '../types';
import { MapPin, Navigation, X } from 'lucide-react';

interface WorldMapProps {
  gameState: GameState;
  onClose: () => void;
  onTravel: (locationName: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ gameState, onClose, onTravel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-serif font-bold text-slate-100">Known World</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-[#0f172a] overflow-hidden group cursor-grab active:cursor-grabbing">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 text-slate-700 font-serif text-xs opacity-50 pointer-events-none">
            SECTOR: ALPHA-9<br/>
            TERRITORY: UNCHARTED
          </div>

          {/* Locations */}
          {gameState.locations.map((location) => {
            const isCurrent = location.id === gameState.currentLocationId;
            
            return (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
              >
                <div className="group/pin relative flex flex-col items-center">
                  
                  {/* Pin Icon */}
                  <button
                    onClick={() => !isCurrent && onTravel(location.name)}
                    disabled={isCurrent}
                    className={`
                      relative z-10 p-2 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300
                      ${isCurrent 
                        ? 'bg-amber-500 border-amber-300 text-slate-900 scale-110' 
                        : 'bg-slate-800 border-indigo-500/50 text-indigo-400 hover:scale-110 hover:bg-slate-700 hover:border-indigo-400'
                      }
                    `}
                  >
                    {isCurrent ? <Navigation className="w-5 h-5 animate-pulse" /> : <MapPin className="w-5 h-5" />}
                  </button>

                  {/* Label - Always visible if current, else on hover */}
                  <div className={`
                    absolute top-full mt-2 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-700 text-center whitespace-nowrap z-20
                    ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover/pin:opacity-100 transition-opacity'}
                  `}>
                    <div className="font-bold text-slate-200 text-sm">{location.name}</div>
                    <div className="text-[10px] text-slate-400 max-w-[150px] truncate">{location.description}</div>
                    {!isCurrent && (
                      <div className="mt-1 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Click to Travel</div>
                    )}
                  </div>
                  
                  {/* Connecting Lines (Visual flair only - assumes center start) */}
                  <div className="absolute top-1/2 left-1/2 w-[200px] h-[1px] bg-gradient-to-r from-slate-700 to-transparent -z-10 origin-left opacity-0 group-hover/pin:opacity-20" style={{ transform: `rotate(${Math.random() * 360}deg)`}} />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500">
          Use the map to travel between discovered locations. Time will pass during travel.
        </div>
      </div>
    </div>
  );
};

export default WorldMap;