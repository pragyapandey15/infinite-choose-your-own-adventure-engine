export interface InventoryItem {
  name: string;
  description: string;
  icon: string; // Simple emoji or string identifier
}

export interface WorldLocation {
  id: string;
  name: string;
  description: string;
  x: number; // 0-100 percentage for map positioning
  y: number; // 0-100 percentage for map positioning
  isUnlocked: boolean;
}

export interface CombatState {
  isActive: boolean;
  enemyName: string;
  enemyHealth: number;
  maxHealth: number;
  description: string;
}

export interface GameState {
  inventory: InventoryItem[];
  currentQuest: string;
  history: string[]; // Summary of previous events for context
  turnCount: number;
  characterName: string;
  characterClass: string;
  appearance: string;
  health: number;
  gold: number;
  locations: WorldLocation[];
  currentLocationId: string;
  combat: CombatState | null;
}

export interface StorySegment {
  title: string;
  narrative: string;
  choices: string[];
  imagePrompt: string;
  soundEnvironment?: 'nature' | 'dungeon' | 'city' | 'battle' | 'mystic';
  // Updates to state returned by AI
  newInventoryItems?: InventoryItem[];
  removedInventoryItems?: string[];
  updatedQuest?: string;
  healthChange?: number;
  goldChange?: number;
  // Map updates
  newLocation?: {
    name: string;
    description: string;
    x: number;
    y: number;
  };
  // Combat updates
  startCombat?: {
    enemyName: string;
    health: number;
    description: string;
  };
  combatUpdate?: {
    newEnemyHealth: number;
    status: 'ongoing' | 'victory' | 'defeat' | 'fled';
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}