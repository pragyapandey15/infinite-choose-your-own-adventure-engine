import React, { useState, useRef } from 'react';
import { GameState } from '../types';
import { MapPin, Navigation, X, Plus, Minus, Maximize } from 'lucide-react';

interface WorldMapProps {
  gameState: GameState;
  onClose: () => void;
  onTravel: (locationName: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ gameState, onClose, onTravel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    // Calculate the offset of the mouse relative to the current position to avoid jumping
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom focused on center for simplicity in this version
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(0.5, scale + delta), 4); // Min 0.5x, Max 4x
    setScale(newScale);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-serif font-bold text-slate-100">Known World</h2>
            <span className="text-xs text-slate-500 ml-2 border-l border-slate-700 pl-2">
              Drag to Pan • Scroll to Zoom
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Viewport */}
        <div 
          className="flex-1 relative bg-[#0f172a] overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* Grid Background (Static relative to viewport, or moving? Moving looks better) */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
              opacity: 0.2,
              backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Map Container Layer */}
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-75 ease-linear will-change-transform"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center'
            }}
          >
            {/* Map Content */}
             <div className="absolute top-4 right-4 text-slate-700 font-serif text-xs opacity-50 pointer-events-none whitespace-nowrap">
               SECTOR: ALPHA-9<br/>
               TERRITORY: UNCHARTED
             </div>

            {/* Locations */}
            {gameState.locations.map((location) => {
              const isCurrent = location.id === gameState.currentLocationId;
              
              return (
                <div
                  key={location.id}
                  className="absolute"
                  style={{ 
                    left: `${location.x}%`, 
                    top: `${location.y}%`,
                    transform: 'translate(-50%, -50%)' // Center the pin on the coordinate
                  }}
                >
                  {/* Counter-scale the content so pins stay readable size */}
                  <div style={{ transform: `scale(${1/scale})` }}>
                    <div className="group/pin relative flex flex-col items-center">
                      
                      {/* Pin Icon */}
                      <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            if (!isCurrent) onTravel(location.name);
                        }}
                        disabled={isCurrent}
                        className={`
                          relative z-10 p-2 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300
                          ${isCurrent 
                            ? 'bg-amber-500 border-amber-300 text-slate-900 scale-110 ring-4 ring-amber-500/20' 
                            : 'bg-slate-800 border-indigo-500/50 text-indigo-400 hover:scale-110 hover:bg-slate-700 hover:border-indigo-400'
                          }
                        `}
                      >
                        {isCurrent ? <Navigation className="w-5 h-5 animate-pulse" /> : <MapPin className="w-5 h-5" />}
                      </button>

                      {/* Label - Always visible if current, else on hover */}
                      <div className={`
                        absolute top-full mt-2 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-700 text-center whitespace-nowrap z-20 pointer-events-none
                        ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover/pin:opacity-100 transition-opacity'}
                      `}>
                        <div className="font-bold text-slate-200 text-sm">{location.name}</div>
                        <div className="text-[10px] text-slate-400 max-w-[150px] truncate">{location.description}</div>
                        {!isCurrent && (
                          <div className="mt-1 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Click to Travel</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
            <button onClick={zoomIn} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 shadow-lg transition-colors">
                <Plus className="w-5 h-5" />
            </button>
            <button onClick={zoomOut} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 shadow-lg transition-colors">
                <Minus className="w-5 h-5" />
            </button>
            <button onClick={resetView} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 shadow-lg transition-colors group" title="Reset View">
                <Maximize className="w-5 h-5 group-hover:scale-90 transition-transform" />
            </button>
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500 z-10">
          Map coordinates are approximate. Travel carefully.
        </div>
      </div>
    </div>
  );
};

export default WorldMap;