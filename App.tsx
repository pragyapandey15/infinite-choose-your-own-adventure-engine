import React, { useState } from 'react';
import { GameState, StorySegment, WorldLocation } from './types';
import { INITIAL_QUEST, CLASS_LOADOUTS } from './constants';
import { generateStory, generateSceneImage } from './services/geminiService';
import { audioManager } from './services/audioService';
import Sidebar from './components/Sidebar';
import StoryCard from './components/StoryCard';
import ActionArea from './components/ActionArea';
import ChatWidget from './components/ChatWidget';
import CharacterCreation from './components/CharacterCreation';
import WorldMap from './components/WorldMap';
import { Menu } from 'lucide-react';

type GamePhase = 'creation' | 'playing';

const STORAGE_KEY = 'infinite_realms_save';

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('creation');
  
  // App State
  // Initial state is placeholder until character creation
  const [gameState, setGameState] = useState<GameState>({
    inventory: [],
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
    combat: null
  });

  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Persistence Logic
  const saveGame = (): boolean => {
    const saveData = {
      gameState,
      currentSegment,
      currentImage,
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
        setGameState(data.gameState);
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

    const initialState: GameState = {
      inventory: loadout.inventory,
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
      combat: null
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

  // Action Handler
  const handleAction = async (action: string) => {
    if (!currentSegment || isLoading) return;
    
    audioManager.init(); // Ensure audio is ready
    audioManager.playTransition(); // Play swoosh sound
    
    setIsLoading(true);
    setCurrentImage(null); // Clear old image while loading new one
    if (isMapOpen) setIsMapOpen(false); // Close map if traveling

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

      // COMBAT LOGIC
      let currentCombat = gameState.combat;

      // Start Combat?
      if (newSegment.startCombat) {
        currentCombat = {
          isActive: true,
          enemyName: newSegment.startCombat.enemyName,
          enemyHealth: newSegment.startCombat.health,
          maxHealth: newSegment.startCombat.health,
          description: newSegment.startCombat.description
        };
        // Force battle music if not already set by AI
        if (!newSegment.soundEnvironment) audioManager.setAmbience('battle');
      } 
      // Update Combat?
      else if (newSegment.combatUpdate && currentCombat && currentCombat.isActive) {
        if (newSegment.combatUpdate.status === 'ongoing') {
          currentCombat = {
            ...currentCombat,
            enemyHealth: newSegment.combatUpdate.newEnemyHealth
          };
        } else {
          // Victory, Defeat, or Fled - End Combat
          currentCombat = null;
        }
      }

      setGameState(prev => ({
        ...prev,
        inventory: newInventory,
        currentQuest: newSegment.updatedQuest || prev.currentQuest,
        history: updatedHistory,
        turnCount: prev.turnCount + 1,
        health: Math.min(100, Math.max(0, prev.health + (newSegment.healthChange || 0))),
        gold: Math.max(0, prev.gold + (newSegment.goldChange || 0)),
        locations: newLocations,
        currentLocationId: newLocationId,
        combat: currentCombat
      }));

      setCurrentSegment(newSegment);

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
          onSave={saveGame} 
          onLoad={loadGame} 
          onToggleMap={() => setIsMapOpen(true)}
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

      {/* AI Chat Widget */}
      <ChatWidget currentNarrative={currentSegment?.narrative || ""} />

    </div>
  );
};

export default App;