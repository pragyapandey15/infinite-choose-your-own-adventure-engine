import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { Backpack, Map as MapIcon, Heart, Coins, User, Save, RotateCcw, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../services/audioService';

interface SidebarProps {
  gameState: GameState;
  onSave: () => boolean;
  onLoad: () => boolean;
  onToggleMap: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ gameState, onSave, onLoad, onToggleMap }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(audioManager.getMuteStatus());
  }, []);

  const handleSave = () => {
    audioManager.playClick();
    if (onSave()) {
      audioManager.playSuccess();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleLoad = () => {
    audioManager.playClick();
    if(window.confirm('Load last save? Current progress will be lost.')) {
      onLoad();
    }
  };

  const handleToggleMap = () => {
    audioManager.playClick();
    onToggleMap();
  };

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 text-slate-300 flex flex-col gap-8 shadow-2xl z-10">
      
      {/* Character Status */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Status</h3>
        <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              <div>
                <div className="font-serif text-slate-100 leading-none">{gameState.characterName}</div>
                <div className="text-xs text-slate-500 mt-1">{gameState.characterClass}</div>
              </div>
            </div>
            <button 
              onClick={handleToggleMute}
              className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-500 hover:text-slate-300"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Health</span>
            </div>
            <span className="font-mono text-rose-400">{gameState.health}/100</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Gold</span>
            </div>
            <span className="font-mono text-amber-400">{gameState.gold}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button 
          onClick={handleToggleMap}
          className="w-full flex items-center justify-between bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-500/50 p-4 rounded-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-950 rounded-md text-indigo-400 group-hover:text-indigo-300">
              <MapIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-indigo-100">World Map</div>
              <div className="text-xs text-indigo-400/70">View known locations</div>
            </div>
          </div>
        </button>
      </div>

      {/* Current Quest */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Current Objective</h3>
        <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-lg text-amber-200/90 font-serif italic text-sm leading-relaxed">
          "{gameState.currentQuest}"
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-4 flex-1">
         <div className="flex items-center gap-2 text-emerald-500">
          <Backpack className="w-5 h-5" />
          <h3 className="text-sm font-bold tracking-wide uppercase">Inventory</h3>
        </div>
        
        {gameState.inventory.length === 0 ? (
          <p className="text-slate-600 italic text-sm">Your bag is empty.</p>
        ) : (
          <ul className="space-y-2">
            {gameState.inventory.map((item, idx) => (
              <li key={`${item.name}-${idx}`} className="bg-slate-800/50 hover:bg-slate-800 transition-colors p-3 rounded-lg border border-slate-700 group relative">
                <div className="flex items-start gap-3">
                  <span className="text-xl bg-slate-900 rounded p-1">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer Controls */}
      <div className="mt-auto pt-4 border-t border-slate-800 space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-3 rounded transition-colors border border-slate-700"
          >
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                <span>Save Game</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleLoad}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-3 rounded transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Load</span>
          </button>
        </div>
        
        <div className="text-xs text-slate-600 text-center">
          Turn: {gameState.turnCount}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;