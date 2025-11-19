
import React, { useState, useEffect } from 'react';
import { GameState, InventoryItem } from '../types';
import { Backpack, Map as MapIcon, Heart, Coins, User, Save, RotateCcw, CheckCircle2, Volume2, VolumeX, Book, Hammer, Shield, Sword } from 'lucide-react';
import { audioManager } from '../services/audioService';

interface SidebarProps {
  gameState: GameState;
  onSave: () => boolean;
  onLoad: () => boolean;
  onToggleMap: () => void;
  onToggleLore: () => void;
  onToggleCrafting: () => void;
  onEquip: (item: InventoryItem) => void;
  onUnequip: (slot: 'mainHand' | 'armor') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ gameState, onSave, onLoad, onToggleMap, onToggleLore, onToggleCrafting, onEquip, onUnequip }) => {
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

  const handleToggleLore = () => {
    audioManager.playClick();
    onToggleLore();
  };

  const handleToggleCrafting = () => {
    audioManager.playClick();
    onToggleCrafting();
  };

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleEquipClick = (item: InventoryItem) => {
    onEquip(item);
  };

  const handleUnequipClick = (slot: 'mainHand' | 'armor') => {
    audioManager.playClick();
    onUnequip(slot);
  }

  // Calculate total stats
  const totalAttack = (gameState.equipment?.mainHand?.stats?.attack || 0);
  const totalDefense = (gameState.equipment?.armor?.stats?.defense || 0);

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
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Sword className="w-3.5 h-3.5" />
              <span>Atk: <span className="text-slate-200 font-mono">{totalAttack}</span></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Def: <span className="text-slate-200 font-mono">{totalDefense}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Equipment</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Main Hand */}
          <button 
            onClick={() => gameState.equipment?.mainHand && handleUnequipClick('mainHand')}
            disabled={!gameState.equipment?.mainHand}
            className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors gap-2 relative group
              ${gameState.equipment?.mainHand 
                ? 'bg-slate-800/50 border-indigo-500/30 hover:bg-slate-800 hover:border-indigo-500/60' 
                : 'bg-slate-900 border-slate-800 border-dashed'
              }`}
          >
            {gameState.equipment?.mainHand ? (
               <>
                 <div className="text-2xl">{gameState.equipment.mainHand.icon}</div>
                 <div className="text-xs font-bold text-slate-200 truncate w-full">{gameState.equipment.mainHand.name}</div>
                 <div className="absolute top-1 right-1 text-[10px] bg-slate-950 px-1 rounded text-slate-500 group-hover:text-rose-400">x</div>
               </>
            ) : (
               <div className="text-slate-600 text-xs flex flex-col items-center gap-1">
                 <Sword className="w-4 h-4 opacity-50" />
                 <span>Main Hand</span>
               </div>
            )}
          </button>

          {/* Armor */}
          <button 
            onClick={() => gameState.equipment?.armor && handleUnequipClick('armor')}
            disabled={!gameState.equipment?.armor}
            className={`p-3 rounded-lg border flex flex-col items-center text-center transition-colors gap-2 relative group
              ${gameState.equipment?.armor 
                ? 'bg-slate-800/50 border-indigo-500/30 hover:bg-slate-800 hover:border-indigo-500/60' 
                : 'bg-slate-900 border-slate-800 border-dashed'
              }`}
          >
             {gameState.equipment?.armor ? (
               <>
                 <div className="text-2xl">{gameState.equipment.armor.icon}</div>
                 <div className="text-xs font-bold text-slate-200 truncate w-full">{gameState.equipment.armor.name}</div>
                 <div className="absolute top-1 right-1 text-[10px] bg-slate-950 px-1 rounded text-slate-500 group-hover:text-rose-400">x</div>
               </>
            ) : (
               <div className="text-slate-600 text-xs flex flex-col items-center gap-1">
                 <Shield className="w-4 h-4 opacity-50" />
                 <span>Armor</span>
               </div>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button 
          onClick={handleToggleMap}
          className="w-full flex items-center justify-between bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-500/50 p-3 rounded-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-950 rounded-md text-indigo-400 group-hover:text-indigo-300">
              <MapIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-indigo-100 text-sm">World Map</div>
              <div className="text-[10px] text-indigo-400/70">View known locations</div>
            </div>
          </div>
        </button>

        <button 
          onClick={handleToggleLore}
          className="w-full flex items-center justify-between bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/30 hover:border-amber-500/50 p-3 rounded-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950 rounded-md text-amber-400 group-hover:text-amber-300">
              <Book className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-amber-100 text-sm">Encyclopedia</div>
              <div className="text-[10px] text-amber-400/70">Characters & Lore</div>
            </div>
          </div>
        </button>

        <button 
          onClick={handleToggleCrafting}
          className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 p-3 rounded-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-md text-slate-400 group-hover:text-white">
              <Hammer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-200 text-sm">Crafting</div>
              <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Combine Items</div>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-200 text-sm truncate">{item.name}</div>
                      {/* Equip Action */}
                      {(item.type === 'weapon' || item.type === 'armor') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEquipClick(item); }}
                          className="text-[10px] bg-indigo-900/50 hover:bg-indigo-600 text-indigo-200 px-2 py-1 rounded border border-indigo-500/30 transition-colors ml-2"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</div>
                    {/* Inline Stats */}
                    {item.stats && (
                       <div className="flex gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                          {item.stats.attack && <span>ATK +{item.stats.attack}</span>}
                          {item.stats.defense && <span>DEF +{item.stats.defense}</span>}
                       </div>
                    )}
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
