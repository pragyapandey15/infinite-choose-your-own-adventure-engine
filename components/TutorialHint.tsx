
import React, { useEffect } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { TUTORIAL_CONTENT } from '../constants';
import { audioManager } from '../services/audioService';

interface TutorialHintProps {
  tutorialId: string;
  onDismiss: () => void;
}

const TutorialHint: React.FC<TutorialHintProps> = ({ tutorialId, onDismiss }) => {
  const content = TUTORIAL_CONTENT[tutorialId];

  useEffect(() => {
    audioManager.playHint();
  }, [tutorialId]);

  if (!content) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-indigo-900/90 backdrop-blur-xl border border-indigo-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(79,70,229,0.4)] relative overflow-hidden">
        
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 shrink-0">
            <Lightbulb className="w-6 h-6 text-indigo-300 animate-pulse" />
          </div>
          
          <div className="flex-1 pt-0.5">
            <h3 className="text-indigo-100 font-bold text-sm uppercase tracking-wider mb-1">
              {content.title}
            </h3>
            <p className="text-indigo-200/90 text-sm leading-relaxed">
              {content.message}
            </p>
          </div>

          <button 
            onClick={() => {
                audioManager.playClick();
                onDismiss();
            }}
            className="p-1 text-indigo-400 hover:text-white hover:bg-indigo-800/50 rounded-lg transition-colors -mt-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialHint;
