
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'misc';

export interface ItemStats {
  attack?: number;
  defense?: number;
  restore?: number; // For potions
}

export interface InventoryItem {
  id?: string; // Optional for backward compatibility, but new items get it
  name: string;
  description: string;
  icon: string; 
  type?: ItemType;
  stats?: ItemStats;
}

export interface Equipment {
  mainHand: InventoryItem | null;
  armor: InventoryItem | null;
}

export interface WorldLocation {
  id: string;
  name: string;
  description: string;
  x: number; // 0-100 percentage for map positioning
  y: number; // 0-100 percentage for map positioning
  isUnlocked: boolean;
}

export interface LoreEntry {
  id: string;
  category: 'Character' | 'Faction' | 'Location' | 'History' | 'Bestiary' | 'Concept';
  name: string;
  description: string;
  icon?: string;
  unlockedAtTurn?: number;
}

export interface CombatLogEntry {
  turn: number;
  text: string;
  type: 'player' | 'enemy' | 'info' | 'damage';
}

export interface CombatState {
  isActive: boolean;
  enemyName: string;
  enemyHealth: number;
  maxHealth: number;
  description: string;
  lastAction?: string;
  log: CombatLogEntry[];
}

export interface StatusEffect {
  id?: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // turns remaining
  type: 'buff' | 'debuff';
}

export interface GameState {
  inventory: InventoryItem[];
  equipment: Equipment; 
  currentQuest: string;
  history: string[]; 
  turnCount: number;
  characterName: string;
  characterClass: string;
  appearance: string;
  health: number;
  gold: number;
  locations: WorldLocation[];
  currentLocationId: string;
  combat: CombatState | null;
  lore: LoreEntry[];
  activeEffects: StatusEffect[]; 
  seenTutorials: string[]; // Track seen tutorial IDs
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
    enemyAction?: string;
  };
  // Lore updates
  newLore?: LoreEntry[];
  // Status Effects
  newStatusEffects?: StatusEffect[];
  removedStatusEffects?: string[]; // names of effects to remove
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  result: InventoryItem;
  ingredients: { name: string; count: number }[];
}
