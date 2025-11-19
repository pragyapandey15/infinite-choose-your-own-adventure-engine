
import React, { useState } from 'react';
import { ShieldAlert, Sword, Zap, ScrollText, ChevronDown, ChevronUp } from 'lucide-react';
import { CombatState } from '../types';
import { audioManager } from '../services/audioService';

interface CombatDisplayProps {
  combatState: CombatState;
}

const CombatDisplay: React.FC<CombatDisplayProps> = ({ combatState }) => {
  const [showLog, setShowLog] = useState(false);
  const healthPercent = Math.max(0, Math.min(100, (combatState.enemyHealth / combatState.maxHealth) * 100));

  const toggleLog = () => {
    audioManager.playClick();
    setShowLog(!showLog);
  };

  return (
    <div className="w-full bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-900 rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.4)]">
            <Sword className="w-5 h-5 text-rose-200 animate-pulse" />
          </div>
          <div>
            <div className="text-rose-200 font-bold text-lg tracking-wide font-serif uppercase">{combatState.enemyName}</div>
            <div className="text-rose-400 text-xs font-semibold tracking-widest">IN COMBAT</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLog}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${showLog ? 'bg-rose-800 text-white' : 'bg-rose-900/40 text-rose-300 hover:bg-rose-800/60'}`}
          >
            <ScrollText className="w-4 h-4" />
            <span className="hidden sm:inline">Battle Log</span>
            {showLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <ShieldAlert className="w-6 h-6 text-rose-500 opacity-50" />
        </div>
      </div>

      {/* Health Bar */}
      <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-rose-900/50 shadow-inner">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-500 ease-out"
          style={{ width: `${healthPercent}%` }}
        />
        {/* Stripes Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InN0cmlwZXMiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBwNDAtNDBNMCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC4xIiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3N0cmlwZXMpIi8+PC9zdmc+')] opacity-30 mix-blend-overlay" />
        
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-sm z-10">
          {combatState.enemyHealth} / {combatState.maxHealth} HP
        </div>
      </div>
      
      {/* Status / Last Action */}
      <div className="mt-3 flex items-start gap-2 bg-rose-900/20 p-2 rounded-lg border border-rose-800/30">
         <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
         <div className="text-sm text-rose-200">
            <span className="font-bold text-amber-400 uppercase text-xs tracking-wide mr-2">Enemy Action:</span>
            <span className="italic">"{combatState.lastAction || 'Prepares to strike...'}"</span>
         </div>
      </div>

      {/* Battle Log Dropdown */}
      {showLog && combatState.log && (
        <div className="mt-3 bg-black/60 border border-rose-900/50 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1.5 shadow-inner animate-in slide-in-from-top-2">
          {combatState.log.length === 0 ? (
            <div className="text-rose-500/50 italic text-center py-2">No combat history yet...</div>
          ) : (
            combatState.log.slice().reverse().map((entry, idx) => (
              <div key={idx} className={`flex gap-2 ${entry.type === 'damage' ? 'pl-4' : ''}`}>
                <span className="text-slate-600 select-none">[{entry.turn}]</span>
                <span className={`
                  ${entry.type === 'player' ? 'text-indigo-300' : ''}
                  ${entry.type === 'enemy' ? 'text-rose-300' : ''}
                  ${entry.type === 'info' ? 'text-slate-400 italic' : ''}
                  ${entry.type === 'damage' ? 'text-amber-500 font-bold' : ''}
                `}>
                  {entry.text}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-2 text-xs text-rose-300/70 text-center italic">
        {combatState.description}
      </div>
    </div>
  );
};

export default CombatDisplay;
