import React, { useState, useEffect } from 'react';
import { CLASS_LOADOUTS } from '../constants';
import { ArrowRight, User, RotateCcw } from 'lucide-react';
import { audioManager } from '../services/audioService';

interface CharacterCreationProps {
  onCreate: (data: { name: string; class: string; appearance: string }) => void;
  onLoad: () => boolean;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreate, onLoad }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Warrior');
  const [appearance, setAppearance] = useState('');
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    // Initialize audio on the first screen interaction possibility if needed
    // But generally we do it on click
    const saved = localStorage.getItem('infinite_realms_save');
    if (saved) setHasSave(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && appearance.trim()) {
      audioManager.playSuccess();
      onCreate({
        name: name.trim(),
        class: selectedClass,
        appearance: appearance.trim()
      });
    }
  };

  const handleClassSelect = (className: string) => {
    audioManager.playClick();
    setSelectedClass(className);
  };

  const handleLoad = () => {
      audioManager.playClick();
      onLoad();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-serif font-bold text-slate-100">Forging a Legend</h1>
          <p className="text-slate-400">Define who you are before stepping into the unknown.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name & Appearance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Name Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-indigo-400 uppercase tracking-wider">Character Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arin the Brave"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

             {/* Appearance Input */}
             <div className="space-y-3">
              <label className="block text-sm font-medium text-indigo-400 uppercase tracking-wider">Appearance Description</label>
              <textarea
                required
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="e.g. Tall, silver hair, wears a red scarf, scar on left cheek..."
                className="w-full h-[58px] bg-slate-950 border border-slate-700 rounded-xl py-4 px-4 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Class Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-indigo-400 uppercase tracking-wider">Select Class</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(CLASS_LOADOUTS).map(([className, details]) => {
                const isSelected = selectedClass === className;
                return (
                  <button
                    key={className}
                    type="button"
                    onClick={() => handleClassSelect(className)}
                    className={`relative p-6 rounded-xl border text-left transition-all duration-300 ${
                      isSelected 
                        ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500/50' 
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl bg-slate-900 p-2 rounded-lg">{details.icon}</span>
                      {isSelected && <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" />}
                    </div>
                    <h3 className={`font-serif font-bold text-lg mb-1 ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                      {className}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{details.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-4 text-xs font-mono text-slate-500">
                        <span>HP: {details.health}</span>
                        <span>Gold: {details.gold}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 flex justify-center space-y-4 flex-col items-center">
            <button
              type="submit"
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-full font-semibold tracking-wide overflow-hidden hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:scale-105"
            >
              <span>Begin Adventure</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {hasSave && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <button
                  type="button"
                  onClick={handleLoad}
                  className="text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors flex items-center justify-center gap-2 py-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Continue Previous Journey
                </button>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default CharacterCreation;