import React, { useState } from 'react';
import { Send, MousePointerClick } from 'lucide-react';
import { audioManager } from '../services/audioService';

interface ActionAreaProps {
  choices: string[];
  onAction: (action: string) => void;
  isLoading: boolean;
}

const ActionArea: React.FC<ActionAreaProps> = ({ choices, onAction, isLoading }) => {
  const [customInput, setCustomInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !isLoading) {
      audioManager.playClick();
      onAction(customInput);
      setCustomInput('');
    }
  };

  const handleChoiceClick = (choice: string) => {
    if (!isLoading) {
      audioManager.playClick();
      onAction(choice);
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 md:p-6 sticky bottom-0 z-20 w-full">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Preset Choices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleChoiceClick(choice)}
              onMouseEnter={() => audioManager.playHover()}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 text-sm font-medium p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-indigo-600 hover:border-indigo-500 text-slate-200 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-left md:text-center h-full"
            >
              <MousePointerClick className="w-4 h-4 opacity-50 shrink-0" />
              <span>{choice}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-600 font-semibold uppercase">OR</span>
            <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Do something else entirely..."
            disabled={isLoading}
            className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-600 transition-shadow"
          />
          <button
            type="submit"
            disabled={!customInput.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActionArea;