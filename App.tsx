
import React, { useState } from 'react';
import { GameState, StorySegment, WorldLocation, LoreEntry, CombatLogEntry, CraftingRecipe, InventoryItem, Equipment, CombatState, StatusEffect } from './types';
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
import TutorialHint from './components/TutorialHint';
import { Menu, Book } from 'lucide-react';

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
    activeEffects: [],
    seenTutorials: []
  });

  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoreOpen, setIsLoreOpen] = useState(false);
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  
  // Notification & Tutorial State
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

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
        if (!loadedState.seenTutorials) loadedState.seenTutorials = [];
        
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
      activeEffects: [],
      seenTutorials: []
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

  const triggerTutorial = (tutorialId: string, currentSeen: string[]): string[] => {
    if (!currentSeen.includes(tutorialId)) {
      setActiveTutorial(tutorialId);
      return [...currentSeen, tutorialId];
    }
    return currentSeen;
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
    setActiveTutorial(null); // Clear existing tutorial if any to prevent stack

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
      let addedLoreCount = 0;
      let lastAddedLoreName = "";

      if (newSegment.newLore && newSegment.newLore.length > 0) {
        newSegment.newLore.forEach(item => {
          // Prevent duplicates based on name
          if (!currentLore.some(l => l.name.toLowerCase() === item.name.toLowerCase())) {
            currentLore.push({
              ...item,
              id: `lore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              unlockedAtTurn: gameState.turnCount + 1
            });
            addedLoreCount++;
            lastAddedLoreName = item.name;
          }
        });
      }

      if (addedLoreCount > 0) {
        const msg = addedLoreCount === 1 
           ? `New Lore Discovered: ${lastAddedLoreName}`
           : `${addedLoreCount} New Lore Entries Discovered`;
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
      }

      // STATUS EFFECTS MANAGEMENT
      let currentEffects = [...(gameState.activeEffects || [])];
      
      // 1. Decrement duration of existing effects (since they 'ticked' in the AI generation)
      currentEffects = currentEffects.map(e => ({
        ...e,
        duration: e.duration - 1
      })).filter(e => e.duration > 0);

      // 2. Remove effects explicitly cured/removed by AI
      if (newSegment.removedStatusEffects) {
        const toRemove = new Set(newSegment.removedStatusEffects.map(n => n.toLowerCase()));
        currentEffects = currentEffects.filter(e => !toRemove.has(e.name.toLowerCase()));
      }

      // 3. Add new effects
      let addedEffect = false;
      if (newSegment.newStatusEffects) {
        newSegment.newStatusEffects.forEach(effect => {
           // Check if already exists to update duration instead of duplicate
           const idx = currentEffects.findIndex(e => e.name === effect.name);
           if (idx !== -1) {
             currentEffects[idx] = effect;
           } else {
             currentEffects.push({ ...effect, id: `eff-${Date.now()}` });
             addedEffect = true;
           }
        });
      }

      // Tutorial Triggers based on state
      let updatedSeenTutorials = [...gameState.seenTutorials];
      if (addedEffect) {
        updatedSeenTutorials = triggerTutorial('status_effects', updatedSeenTutorials);
      }

      // COMBAT LOGIC
      let currentCombat = gameState.combat ? { ...gameState.combat } : null;
      let combatEnded = false;

      // Start Combat
      if (newSegment.startCombat) {
        currentCombat = {
          isActive: true,
          enemyName: newSegment.startCombat.enemyName,
          enemyHealth: newSegment.startCombat.health,
          maxHealth: newSegment.startCombat.health,
          description: newSegment.startCombat.description,
          lastAction: undefined,
          log: [{ turn: gameState.turnCount + 1, text: `Encountered ${newSegment.startCombat.enemyName}!`, type: 'info' }]
        };
        updatedSeenTutorials = triggerTutorial('combat_basics', updatedSeenTutorials);
      } 
      // Update Combat
      else if (currentCombat && currentCombat.isActive && newSegment.combatUpdate) {
        
        // Log Player Action
        currentCombat.log.push({
          turn: gameState.turnCount,
          text: `You: ${action}`,
          type: 'player'
        });

        // Log Damage Dealt to Enemy
        const dmgToEnemy = currentCombat.enemyHealth - newSegment.combatUpdate.newEnemyHealth;
        if (dmgToEnemy > 0) {
          currentCombat.log.push({
            turn: gameState.turnCount,
            text: `Hit ${currentCombat.enemyName} for ${dmgToEnemy} damage`,
            type: 'damage'
          });
        }

        // Log Enemy Action
        if (newSegment.combatUpdate.enemyAction) {
           currentCombat.lastAction = newSegment.combatUpdate.enemyAction;
           currentCombat.log.push({
             turn: gameState.turnCount,
             text: `${currentCombat.enemyName}: ${newSegment.combatUpdate.enemyAction}`,
             type: 'enemy'
           });
           updatedSeenTutorials = triggerTutorial('enemy_tactics', updatedSeenTutorials);
        }

        // Log Player Damage Taken
        if (newSegment.healthChange && newSegment.healthChange < 0) {
           currentCombat.log.push({
             turn: gameState.turnCount,
             text: `You took ${Math.abs(newSegment.healthChange)} damage`,
             type: 'damage'
           });
        }

        // Update State
        currentCombat.enemyHealth = newSegment.combatUpdate.newEnemyHealth;
        
        // Check status
        if (newSegment.combatUpdate.status !== 'ongoing') {
          currentCombat.isActive = false;
          currentCombat.description = `Combat ended: ${newSegment.combatUpdate.status}`;
          currentCombat.log.push({ turn: gameState.turnCount, text: `Victory!`, type: 'info' });
          combatEnded = true;
          // Revert audio
          audioManager.setAmbience('nature'); // or based on location
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
        activeEffects: currentEffects,
        seenTutorials: updatedSeenTutorials
      };

      setGameState(nextGameState);
      setCurrentSegment(newSegment);

      // Auto-save on Combat End
      if (combatEnded) {
        // We pass overrides because state updates are async and we want to save THIS moment
        saveGame(nextGameState, newSegment, null); 
      }

      // 3. Generate Image in background
      generateSceneImage(newSegment.imagePrompt).then(url => {
        if (url) setCurrentImage(url);
      });

    } catch (error) {
      console.error("Failed to take action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (gamePhase === 'creation') {
    return <CharacterCreation onCreate={handleCharacterCreate} onLoad={() => { if(loadGame()) return true; return false; }} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Notification Toast */}
      {notification && (
         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="bg-amber-500/90 text-black font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2">
             <Book className="w-5 h-5" />
             {notification}
           </div>
         </div>
      )}

      {/* Active Tutorial Hint */}
      {activeTutorial && (
        <TutorialHint 
          tutorialId={activeTutorial} 
          onDismiss={() => setActiveTutorial(null)} 
        />
      )}

      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-slate-900 rounded-full border border-slate-700 shadow-lg text-indigo-400"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        
        {/* Scrollable Story Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          {currentSegment && (
            <StoryCard 
              title={currentSegment.title}
              narrative={currentSegment.narrative}
              imageUrl={currentImage}
              isLoading={isLoading}
              combatState={gameState.combat}
            />
          )}
        </div>

        {/* Fixed Action Area */}
        {currentSegment && (
          <ActionArea 
            choices={currentSegment.choices} 
            onAction={handleAction} 
            isLoading={isLoading}
          />
        )}

        {/* Floating Chat Widget */}
        <ChatWidget currentNarrative={currentSegment?.narrative || ''} />
        
        {/* Modals */}
        {isMapOpen && (
          <WorldMap 
            gameState={gameState} 
            onClose={() => setIsMapOpen(false)} 
            onTravel={(locName) => handleAction(`Travel to ${locName}`)} 
          />
        )}
        {isLoreOpen && (
          <Encyclopedia 
             gameState={gameState} 
             onClose={() => setIsLoreOpen(false)} 
          />
        )}
        {isCraftingOpen && (
          <CraftingModal 
            gameState={gameState}
            onClose={() => setIsCraftingOpen(false)}
            onCraft={handleCraft}
          />
        )}
      </div>
    </div>
  );
};

export default App;
