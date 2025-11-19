
import React, { useState } from 'react';
import { LoreEntry, GameState } from '../types';
import { X, Book, Bookmark, Scroll, Sword, User, MapPin, Sparkles, Skull } from 'lucide-react';
import { audioManager } from '../services/audioService';

interface EncyclopediaProps {
  gameState: GameState;
  onClose: () => void;
}

type Category = 'All' | 'Character' | 'Faction' | 'Location' | 'History' | 'Bestiary' | 'Concept';

const Encyclopedia: React.FC<EncyclopediaProps> = ({ gameState, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);

  const categories: { id: Category; icon: React.ReactNode }[] = [
    { id: 'All', icon: <Book className="w-4 h-4" /> },
    { id: 'Character', icon: <User className="w-4 h-4" /> },
    { id: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { id: 'Faction', icon: <Sword className="w-4 h-4" /> },
    { id: 'Bestiary', icon: <Skull className="w-4 h-4" /> },
    { id: 'History', icon: <Scroll className="w-4 h-4" /> },
    { id: 'Concept', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const filteredEntries = gameState.lore?.filter(entry => 
    activeCategory === 'All' || entry.category === activeCategory
  ) || [];

  const handleCategoryChange = (cat: Category) => {
    audioManager.playClick();
    setActiveCategory(cat);
    setSelectedEntry(null);
  };

  const handleEntryClick = (entry: LoreEntry) => {
    audioManager.playClick();
    setSelectedEntry(entry);
  };

  const handleClose = () => {
    audioManager.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-700/30">
              <Book className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-100">Codex of Knowledge</h2>
              <p className="text-xs text-slate-500">Discovered Lore & Legends</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar / Categories */}
          <div className="w-16 md:w-48 border-r border-slate-800 bg-slate-950/50 flex flex-col overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  flex items-center gap-3 p-4 text-sm font-medium transition-colors border-l-2
                  ${activeCategory === cat.id 
                    ? 'bg-slate-800 border-amber-500 text-amber-400' 
                    : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }
                `}
              >
                {cat.icon}
                <span className="hidden md:block">{cat.id}</span>
              </button>
            ))}
          </div>

          {/* Entries List */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* List Column */}
            <div className={`
              flex-1 overflow-y-auto p-4 border-r border-slate-800
              ${selectedEntry ? 'hidden md:block' : 'block'}
            `}>
              {filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                  <Book className="w-12 h-12 opacity-20" />
                  <p className="text-sm italic">No knowledge recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleEntryClick(entry)}
                      className={`
                        w-full text-left p-4 rounded-lg border transition-all group
                        ${selectedEntry?.id === entry.id
                          ? 'bg-slate-800 border-indigo-500/50 ring-1 ring-indigo-500/20'
                          : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-serif font-bold ${selectedEntry?.id === entry.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {entry.icon} {entry.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                          {entry.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 group-hover:text-slate-400 transition-colors">
                        {entry.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detail View (Mobile Overlay / Desktop Column) */}
            <div className={`
              flex-1 bg-slate-900 p-6 overflow-y-auto
              ${selectedEntry ? 'block' : 'hidden md:flex md:items-center md:justify-center'}
            `}>
              {selectedEntry ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                   <button 
                    onClick={() => setSelectedEntry(null)}
                    className="md:hidden mb-4 flex items-center gap-2 text-slate-500 text-sm"
                   >
                     <X className="w-4 h-4" /> Close Entry
                   </button>

                  <div className="flex items-center gap-3 mb-6">
                     <span className="text-4xl">{selectedEntry.icon || <Bookmark className="w-8 h-8 text-amber-500" />}</span>
                     <div>
                       <h3 className="text-2xl font-serif font-bold text-slate-100">{selectedEntry.name}</h3>
                       <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{selectedEntry.category}</span>
                     </div>
                  </div>
                  
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-serif text-base">
                      {selectedEntry.description}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-600 font-mono">
                    Entry ID: {selectedEntry.id} <br/>
                    Discovered at Turn: {selectedEntry.unlockedAtTurn || '?'}
                  </div>
                </div>
              ) : (
                <div className="text-slate-600 text-sm italic flex flex-col items-center gap-2">
                   <Scroll className="w-8 h-8 opacity-20" />
                   <span>Select an entry to read details</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Encyclopedia;
