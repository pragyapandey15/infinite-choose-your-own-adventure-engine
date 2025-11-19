import React from 'react';
import { ShieldAlert, Sword } from 'lucide-react';
import { CombatState } from '../types';

interface CombatDisplayProps {
  combatState: CombatState;
}

const CombatDisplay: React.FC<CombatDisplayProps> = ({ combatState }) => {
  const healthPercent = Math.max(0, Math.min(100, (combatState.enemyHealth / combatState.maxHealth) * 100));

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
        <ShieldAlert className="w-6 h-6 text-rose-500 opacity-50" />
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
      
      <div className="mt-2 text-xs text-rose-300/70 text-center italic">
        {combatState.description}
      </div>
    </div>
  );
};

export default CombatDisplay;