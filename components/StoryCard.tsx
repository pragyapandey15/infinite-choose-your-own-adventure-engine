import React from 'react';
import { Sparkles } from 'lucide-react';
import { CombatState } from '../types';
import CombatDisplay from './CombatDisplay';

interface StoryCardProps {
  title: string;
  narrative: string;
  imageUrl: string | null;
  isLoading: boolean;
  combatState: CombatState | null;
}

const StoryCard: React.FC<StoryCardProps> = ({ title, narrative, imageUrl, isLoading, combatState }) => {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full animate-in fade-in duration-700">
      {/* Image Section */}
      <div className="relative w-full aspect-video bg-black/40 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl group">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3 bg-slate-900/80 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium tracking-wider animate-pulse">Dreaming up reality...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Scene visualization" 
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 ${combatState?.isActive ? 'sepia-[.5] hue-rotate-[-30deg] saturate-150' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600">
             <span className="text-sm italic">Visual feed offline...</span>
          </div>
        )}
      </div>

      {/* Combat UI Layer */}
      {combatState && combatState.isActive && (
        <CombatDisplay combatState={combatState} />
      )}

      {/* Text Section */}
      <div className="space-y-4 px-2 md:px-4">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100 leading-tight tracking-tight">
          {title}
        </h2>
        <div className="prose prose-invert prose-lg max-w-none font-serif leading-relaxed text-slate-300">
          <p className="whitespace-pre-line">{narrative}</p>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;