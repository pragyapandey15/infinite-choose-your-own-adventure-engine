
import React, { useState } from 'react';
import { GameState, CraftingRecipe } from '../types';
import { CRAFTING_RECIPES } from '../constants';
import { X, Hammer, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { audioManager } from '../services/audioService';

interface CraftingModalProps {
  gameState: GameState;
  onClose: () => void;
  onCraft: (recipe: CraftingRecipe) => void;
}

const CraftingModal: React.FC<CraftingModalProps> = ({ gameState, onClose, onCraft }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);

  const getIngredientCount = (itemName: string) => {
    return gameState.inventory.filter(i => i.name.toLowerCase() === itemName.toLowerCase()).length;
  };

  const canCraft = (recipe: CraftingRecipe) => {
    return recipe.ingredients.every(ing => getIngredientCount(ing.name) >= ing.count);
  };

  const handleRecipeClick = (recipe: CraftingRecipe) => {
    audioManager.playClick();
    setSelectedRecipe(recipe);
  };

  const handleCraftClick = () => {
    if (selectedRecipe && canCraft(selectedRecipe)) {
      audioManager.playCraft();
      onCraft(selectedRecipe);
    }
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
            <div className="p-2 bg-slate-700/50 rounded-lg border border-slate-600">
              <Hammer className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-100">Crafting Table</h2>
              <p className="text-xs text-slate-500">Forge, Brew, and Create</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Recipe List */}
          <div className="w-1/3 border-r border-slate-800 bg-slate-950/50 overflow-y-auto p-2 space-y-1">
            {CRAFTING_RECIPES.map((recipe) => {
              const craftable = canCraft(recipe);
              const isSelected = selectedRecipe?.id === recipe.id;
              return (
                <button
                  key={recipe.id}
                  onClick={() => handleRecipeClick(recipe)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                    ${isSelected ? 'bg-indigo-900/40 border border-indigo-500/50' : 'hover:bg-slate-800 border border-transparent'}
                  `}
                >
                  <div className={`text-2xl bg-slate-900 p-1.5 rounded ${craftable ? '' : 'opacity-50 grayscale'}`}>
                    {recipe.result.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                      {recipe.result.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {craftable ? <span className="text-emerald-500">Craftable</span> : 'Missing items'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail View */}
          <div className="flex-1 bg-slate-900 p-6 overflow-y-auto relative">
            {selectedRecipe ? (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
                
                {/* Output Preview */}
                <div className="flex flex-col items-center justify-center py-8 border-b border-slate-800">
                  <div className="text-6xl mb-4 drop-shadow-2xl animate-bounce-slow">
                    {selectedRecipe.result.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-100">{selectedRecipe.result.name}</h3>
                  <p className="text-slate-400 text-center max-w-md mt-2">{selectedRecipe.result.description}</p>
                </div>

                {/* Ingredients */}
                <div className="flex-1 py-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Required Materials</h4>
                  <div className="space-y-3">
                    {selectedRecipe.ingredients.map((ing, idx) => {
                      const count = getIngredientCount(ing.name);
                      const hasEnough = count >= ing.count;
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${hasEnough ? 'bg-slate-800/50 border-slate-700' : 'bg-rose-950/10 border-rose-900/30'}`}>
                          <span className="text-slate-200 font-medium">{ing.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-mono ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {count} / {ing.count}
                            </span>
                            {hasEnough ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-6">
                  <button
                    onClick={handleCraftClick}
                    disabled={!canCraft(selectedRecipe)}
                    className={`
                      w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                      ${canCraft(selectedRecipe) 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <Hammer className="w-5 h-5" />
                    Craft Item
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-50">
                <Hammer className="w-16 h-16" />
                <p>Select a recipe to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingModal;
