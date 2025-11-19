
import React, { useState } from 'react';
import { GameState, StorySegment, WorldLocation, LoreEntry, CombatLogEntry, CraftingRecipe, InventoryItem, Equipment } from './types';
import { INITIAL_QUEST, CLASS_LOADOUTS } from './constants';
import { generateStory, generateSceneImage } from './services/geminiService';
import { audioManager } from './services/audioService';
import Sidebar from './components/Sidebar';
import StoryCard from './components/StoryCard';
import ActionArea from './components/ActionArea';
import ChatWidget from './components/ChatWidget';
import CharacterCreation from './components/CharacterCreation';
import WorldMap from './components/WorldMap';
import Encyclopedia from './components/Encyclopedia';
import CraftingModal from './components/CraftingModal';
import { Menu } from 'lucide-react';

type GamePhase = 'creation' | 'playing';

const STORAGE_KEY = 'infinite_realms_save';

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('creation');
  
  // App State
  const [gameState, setGameState] = useState<GameState>({
    inventory: [],
    equipment: { mainHand: null, armor: null },
    currentQuest: INITIAL_QUEST,
    history: [],
    turnCount: 1,
    characterName: "Traveler",
    characterClass: "Unknown",
    appearance: "Unknown",
    health: 100,
    gold: 10,
    locations: [],
    currentLocationId: 'start',
    combat: null,
    lore: [],
    activeEffects: []
  });

  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoreOpen, setIsLoreOpen] = useState(false);
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);

  // Persistence Logic
  const saveGame = (
    stateOverride?: GameState,
    segmentOverride?: StorySegment | null,
    imageOverride?: string | null
  ): boolean => {
    const state = stateOverride || gameState;
    const segment = segmentOverride !== undefined ? segmentOverride : currentSegment;
    const image = imageOverride !== undefined ? imageOverride : currentImage;

    const saveData = {
      gameState: state,
      currentSegment: segment,
      currentImage: image,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error("Save failed", e);
      return false;
    }
  };

  const loadGame = (): boolean => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Ensure compatibility with older saves
        const loadedState = data.gameState;
        if (!loadedState.lore) loadedState.lore = [];
        if (!loadedState.equipment) loadedState.equipment = { mainHand: null, armor: null };
        if (!loadedState.activeEffects) loadedState.activeEffects = [];
        
        setGameState(loadedState);
        setCurrentSegment(data.currentSegment);
        setCurrentImage(data.currentImage);
        setGamePhase('playing');
        // Restore ambience if possible
        if (data.currentSegment?.soundEnvironment) {
           audioManager.init();
           audioManager.setAmbience(data.currentSegment.soundEnvironment);
        }
        return true;
      } catch (e) {
        console.error("Load failed", e);
        return false;
      }
    }
    return false;
  };

  const handleCharacterCreate = async (data: { name: string; class: string; appearance: string }) => {
    audioManager.init(); // Initialize audio on game start
    const loadout = CLASS_LOADOUTS[data.class];
    
    const initialLocation: WorldLocation = {
      id: 'start',
      name: 'The Awakening Site',
      description: 'Where your journey begins.',
      x: 50,
      y: 50,
      isUnlocked: true
    };

    // Auto-equip logic for starters
    const starterWeapon = loadout.inventory.find(i => i.type === 'weapon') || null;
    const starterArmor = loadout.inventory.find(i => i.type === 'armor') || null;
    
    // Filter out equipped items from initial inventory
    const initialInventory = loadout.inventory.filter(i => i !== starterWeapon && i !== starterArmor);

    const initialState: GameState = {
      inventory: initialInventory,
      equipment: {
        mainHand: starterWeapon || null,
        armor: starterArmor || null
      },
      currentQuest: INITIAL_QUEST,
      history: [],
      turnCount: 1,
      characterName: data.name,
      characterClass: data.class,
      appearance: data.appearance,
      health: loadout.health,
      gold: loadout.gold,
      locations: [initialLocation],
      currentLocationId: initialLocation.id,
      combat: null,
      lore: [],
      activeEffects: []
    };

    setGameState(initialState);
    setGamePhase('playing');
    setIsLoading(true);
    
    // Start basic ambience while loading
    audioManager.setAmbience('mystic');

    // Construct initial prompt using character details
    const initialPrompt = `Begin the adventure. The character is a ${data.class} named ${data.name}. Appearance: ${data.appearance}. They wake up in a strange fantasy location called "The Awakening Site".`;
    
    try {
      const segment = await generateStory("", initialPrompt, initialState);
      setCurrentSegment(segment);
      
      if (segment.soundEnvironment) {
        audioManager.setAmbience(segment.soundEnvironment);
      } else {
        audioManager.setAmbience('nature'); // default
      }
      
      generateSceneImage(segment.imagePrompt).then(url => {
        if (url) setCurrentImage(url);
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCraft = (recipe: CraftingRecipe) => {
    const newInventory = [...gameState.inventory];
    
    // Transactional check before mutation to be extra safe
    const canAfford = recipe.ingredients.every(ing => {
      const count = newInventory.filter(i => i.name.toLowerCase() === ing.name.toLowerCase()).length;
      return count >= ing.count;
    });

    if (!canAfford) {
      console.error("Crafting failed: Insufficient ingredients");
      return;
    }

    // Remove ingredients
    for (const ing of recipe.ingredients) {
      let removedCount = 0;
      // iterate backward to safely splice
      for (let i = newInventory.length - 1; i >= 0; i--) {
        if (removedCount >= ing.count) break;
        if (newInventory[i].name.toLowerCase() === ing.name.toLowerCase()) {
          newInventory.splice(i, 1);
          removedCount++;
        }
      }
    }

    // Add result with unique ID
    const craftedItem = { 
      ...recipe.result, 
      id: `crafted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };
    newInventory.push(craftedItem);

    setGameState(prev => ({
      ...prev,
      inventory: newInventory,
      // Add to history so AI knows context for next turn
      history: [...prev.history, `Crafted ${recipe.result.name}`]
    }));
  };

  const handleEquip = (item: InventoryItem) => {
    audioManager.playEquip();
    const slot = item.type === 'weapon' ? 'mainHand' : item.type === 'armor' ? 'armor' : null;
    if (!slot) return;

    const newEquipment = { ...gameState.equipment };
    const newInventory = [...gameState.inventory];

    // If slot occupied, unequip current item first
    if (newEquipment[slot]) {
      newInventory.push(newEquipment[slot]!);
    }

    // Remove new item from inventory
    const itemIndex = newInventory.indexOf(item); // Using reference equality since we map directly
    if (itemIndex > -1) {
      newInventory.splice(itemIndex, 1);
    }

    // Equip new item
    newEquipment[slot] = item;

    setGameState({
      ...gameState,
      inventory: newInventory,
      equipment: newEquipment
    });
  };

  const handleUnequip = (slot: 'mainHand' | 'armor') => {
     const item = gameState.equipment[slot];
     if (!item) return;
     
     const newEquipment = { ...gameState.equipment };
     newEquipment[slot] = null;
     
     const newInventory = [...gameState.inventory, item];
     
     setGameState({
       ...gameState,
       equipment: newEquipment,
       inventory: newInventory
     });
  };

  // Action Handler
  const handleAction = async (action: string) => {
    if (!currentSegment || isLoading) return;
    
    audioManager.init(); // Ensure audio is ready
    audioManager.playTransition(); // Play swoosh sound
    
    setIsLoading(true);
    setCurrentImage(null); // Clear old image while loading new one
    if (isMapOpen) setIsMapOpen(false); // Close map if traveling
    if (isLoreOpen) setIsLoreOpen(false);
    if (isCraftingOpen) setIsCraftingOpen(false);

    try {
      // Update history buffer
      const updatedHistory = [
        ...gameState.history,
        `Scene: ${currentSegment.title}`,
        `Action: ${action}`
      ].slice(-10); // Keep last 10 interactions

      const tempState = { ...gameState, history: updatedHistory };

      // 1. Get new story segment from Gemini
      const newSegment = await generateStory(currentSegment.narrative, action, tempState);
      
      // Update audio environment based on new scene
      if (newSegment.soundEnvironment) {
        audioManager.setAmbience(newSegment.soundEnvironment);
      }

      // 2. Process State Updates from AI
      const newInventory = [...gameState.inventory];
      
      // Add items
      if (newSegment.newInventoryItems) {
        newSegment.newInventoryItems.forEach(item => {
          if (!newInventory.some(i => i.name === item.name)) {
            // Assign ID if missing (simple timestamp for now)
            if(!item.id) item.id = `item-${Date.now()}-${Math.random()}`;
            newInventory.push(item);
          }
        });
      }

      // Remove items
      if (newSegment.removedInventoryItems) {
        const toRemove = new Set(newSegment.removedInventoryItems.map(n => n.toLowerCase()));
        for (let i = newInventory.length - 1; i >= 0; i--) {
          if (toRemove.has(newInventory[i].name.toLowerCase())) {
            newInventory.splice(i, 1);
          }
        }
      }

      // Location Updates
      let newLocations = [...gameState.locations];
      let newLocationId = gameState.currentLocationId;

      if (newSegment.newLocation) {
        const exists = newLocations.find(l => l.name === newSegment.newLocation!.name);
        if (!exists) {
          const createdLocation: WorldLocation = {
            id: `loc-${Date.now()}`,
            name: newSegment.newLocation.name,
            description: newSegment.newLocation.description,
            x: newSegment.newLocation.x,
            y: newSegment.newLocation.y,
            isUnlocked: true
          };
          newLocations.push(createdLocation);
          newLocationId = createdLocation.id;
        } else {
          newLocationId = exists.id;
        }
      } else if (action.startsWith("Travel to ")) {
            const targetName = action.replace("Travel to ", "");
            const target = newLocations.find(l => l.name === targetName);
            if (target) newLocationId = target.id;
      }

      // Lore Updates
      const currentLore = [...(gameState.lore || [])];
      if (newSegment.newLore && newSegment.newLore.length > 0) {
        newSegment.newLore.forEach(item => {
          // Prevent duplicates based on name
          if (!currentLore.some(l => l.name.toLowerCase() === item.name.toLowerCase())) {
            currentLore.push({
              ...item,
              id: `lore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              unlockedAtTurn: gameState.turnCount + 1
            });
          }
        });
      }

      // STATUS EFFECTS MANAGEMENT
      let currentEffects = [...(gameState.activeEffects || [])];
      
      // 1. Decrement duration of existing effects (since they 'ticked' in the AI generation)
      currentEffects = currentEffects.map(e => ({...e, duration: e.duration - 1})).filter(e => e.duration > 0);

      // 2. Remove specific effects if cured
      if (newSegment.removedStatusEffects) {
        const toRemove = new Set(newSegment.removedStatusEffects.map(n => n.toLowerCase()));
        currentEffects = currentEffects.filter(e => !toRemove.has(e.name.toLowerCase()));
      }

      // 3. Add new effects
      if (newSegment.newStatusEffects) {
         newSegment.newStatusEffects.forEach(effect => {
            // If effect exists, refresh/overwrite it
            const existingIdx = currentEffects.findIndex(e => e.name.toLowerCase() === effect.name.toLowerCase());
            if (existingIdx >= 0) {
               currentEffects[existingIdx] = { ...effect, id: currentEffects[existingIdx].id || `effect-${Date.now()}` };
            } else {
               currentEffects.push({ ...effect, id: `effect-${Date.now()}-${Math.random()}` });
            }
         });
      }

      // COMBAT LOGIC
      let currentCombat = gameState.combat;
      let combatEnded = false;

      // Start Combat?
      if (newSegment.startCombat) {
        currentCombat = {
          isActive: true,
          enemyName: newSegment.startCombat.enemyName,
          enemyHealth: newSegment.startCombat.health,
          maxHealth: newSegment.startCombat.health,
          description: newSegment.startCombat.description,
          lastAction: "Enters the fray!",
          log: [{ turn: gameState.turnCount + 1, text: `Encounter started vs ${newSegment.startCombat.enemyName}`, type: 'info' }]
        };
        // Force battle music if not already set by AI
        if (!newSegment.soundEnvironment) audioManager.setAmbience('battle');
      } 
      // Update Combat?
      else if (newSegment.combatUpdate && currentCombat && currentCombat.isActive) {
        // Calculate estimated damage for logs
        const enemyDamage = Math.max(0, currentCombat.enemyHealth - newSegment.combatUpdate.newEnemyHealth);
        const playerDamage = newSegment.healthChange || 0;
        
        const newLogs: CombatLogEntry[] = [
          ...(currentCombat.log || []),
          { turn: gameState.turnCount + 1, text: `> ${action}`, type: 'player' },
          { turn: gameState.turnCount + 1, text: `${newSegment.combatUpdate.enemyAction || 'Acts...'}`, type: 'enemy' }
        ];

        if (enemyDamage > 0) {
           newLogs.push({ turn: gameState.turnCount + 1, text: `${currentCombat.enemyName} took ${enemyDamage} damage.`, type: 'damage' });
        }
        if (playerDamage < 0) {
           newLogs.push({ turn: gameState.turnCount + 1, text: `You took ${Math.abs(playerDamage)} damage.`, type: 'damage' });
        }

        if (newSegment.combatUpdate.status === 'ongoing') {
          currentCombat = {
            ...currentCombat,
            enemyHealth: newSegment.combatUpdate.newEnemyHealth,
            lastAction: newSegment.combatUpdate.enemyAction || "Attacks!",
            log: newLogs
          };
        } else {
          // Victory, Defeat, or Fled - End Combat
          currentCombat = null;
          combatEnded = true;
        }
      }

      const nextGameState: GameState = {
        ...gameState,
        inventory: newInventory,
        currentQuest: newSegment.updatedQuest || gameState.currentQuest,
        history: updatedHistory,
        turnCount: gameState.turnCount + 1,
        health: Math.min(100, Math.max(0, gameState.health + (newSegment.healthChange || 0))),
        gold: Math.max(0, gameState.gold + (newSegment.goldChange || 0)),
        locations: newLocations,
        currentLocationId: newLocationId,
        combat: currentCombat,
        lore: currentLore,
        activeEffects: currentEffects
      };

      setGameState(nextGameState);
      setCurrentSegment(newSegment);

      // Auto-save on combat completion
      if (combatEnded) {
        saveGame(nextGameState, newSegment, null);
      }

      // 3. Generate Image
      const imageUrl = await generateSceneImage(newSegment.imagePrompt);
      setCurrentImage(imageUrl);

    } catch (error) {
      console.error("Turn error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTravel = (locationName: string) => {
    handleAction(`Travel to ${locationName}`);
  };

  if (gamePhase === 'creation') {
    return <CharacterCreation onCreate={handleCharacterCreate} onLoad={loadGame} />;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-950">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => { audioManager.playClick(); setIsSidebarOpen(!isSidebarOpen); }}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable Story Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="min-h-full flex flex-col pt-8 pb-24 md:pt-12">
            {currentSegment && (
              <StoryCard 
                title={currentSegment.title}
                narrative={currentSegment.narrative}
                imageUrl={currentImage}
                isLoading={isLoading && !currentImage}
                combatState={gameState.combat}
              />
            )}
            
            {/* Loading State Indicator for Text */}
            {isLoading && !currentSegment && (
               <div className="flex items-center justify-center h-64">
                 <div className="text-indigo-500 animate-pulse">Initializing World...</div>
               </div>
            )}
          </div>
        </div>

        {/* Fixed Action Area */}
        <ActionArea 
          choices={currentSegment?.choices || []} 
          onAction={handleAction}
          isLoading={isLoading}
        />
      </div>

      {/* Right Sidebar (Desktop: Fixed, Mobile: Drawer) */}
      <div className={`
        fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out z-30
        md:relative md:transform-none md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <Sidebar 
          gameState={gameState} 
          onSave={() => saveGame()} 
          onLoad={loadGame} 
          onToggleMap={() => setIsMapOpen(true)}
          onToggleLore={() => setIsLoreOpen(true)}
          onToggleCrafting={() => setIsCraftingOpen(true)}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
        />
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Map Modal */}
      {isMapOpen && (
        <WorldMap 
          gameState={gameState} 
          onClose={() => setIsMapOpen(false)} 
          onTravel={handleTravel}
        />
      )}

      {/* Lore Encyclopedia Modal */}
      {isLoreOpen && (
        <Encyclopedia 
          gameState={gameState} 
          onClose={() => setIsLoreOpen(false)} 
        />
      )}

      {/* Crafting Modal */}
      {isCraftingOpen && (
        <CraftingModal 
          gameState={gameState}
          onClose={() => setIsCraftingOpen(false)}
          onCraft={handleCraft}
        />
      )}

      {/* AI Chat Widget */}
      <ChatWidget currentNarrative={currentSegment?.narrative || ""} />

    </div>
  );
};

export default App;
