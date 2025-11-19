
import { InventoryItem, CraftingRecipe } from './types';

export const CLASS_LOADOUTS: Record<string, { inventory: InventoryItem[], health: number, gold: number, description: string, icon: string }> = {
  Warrior: {
    inventory: [
      { name: "Rusty Sword", description: "Reliable steel.", icon: "⚔️", type: 'weapon', stats: { attack: 5 } },
      { name: "Wooden Shield", description: "Splintered but sturdy.", icon: "🛡️", type: 'armor', stats: { defense: 3 } },
      { name: "Health Potion", description: "Restores minimal health.", icon: "🧪", type: 'consumable', stats: { restore: 20 } }
    ],
    health: 120,
    gold: 10,
    description: "A master of arms and armor, built for the front lines.",
    icon: "⚔️"
  },
  Mage: {
    inventory: [
      { name: "Gnarled Staff", description: "Hums with faint energy.", icon: "🔮", type: 'weapon', stats: { attack: 8 } },
      { name: "Cloth Robes", description: "Simple protection.", icon: "👘", type: 'armor', stats: { defense: 1 } },
      { name: "Mana Potion", description: "Blue and bubbling.", icon: "🧪", type: 'consumable' }
    ],
    health: 70,
    gold: 30,
    description: "A scholar of the arcane, wielding destructive magic.",
    icon: "🔮"
  },
  Rogue: {
    inventory: [
      { name: "Twin Daggers", description: "Sharp and concealable.", icon: "🗡️", type: 'weapon', stats: { attack: 6 } },
      { name: "Leather Vest", description: "Light and flexible.", icon: "🧥", type: 'armor', stats: { defense: 2 } },
      { name: "Thieves Tools", description: "For opening closed doors.", icon: "🗝️", type: 'misc' }
    ],
    health: 90,
    gold: 50,
    description: "A shadow in the night, skilled in stealth and trickery.",
    icon: "🗡️"
  }
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'iron-armor',
    name: 'Iron Armor',
    description: 'Sturdy protection against physical attacks.',
    result: { name: 'Iron Armor', description: 'A complete set of iron plates.', icon: '🛡️', type: 'armor', stats: { defense: 10 } },
    ingredients: [
      { name: 'Iron Ore', count: 2 },
      { name: 'Leather Scraps', count: 1 }
    ]
  },
  {
    id: 'steel-sword',
    name: 'Steel Sword',
    description: 'A finely crafted blade.',
    result: { name: 'Steel Sword', description: 'Sharp and well-balanced.', icon: '⚔️', type: 'weapon', stats: { attack: 12 } },
    ingredients: [
      { name: 'Iron Ore', count: 3 },
      { name: 'Wood', count: 1 }
    ]
  },
  {
    id: 'health-potion',
    name: 'Health Potion',
    description: 'Restores a small amount of health.',
    result: { name: 'Health Potion', description: 'A red bubbling liquid.', icon: '🧪', type: 'consumable', stats: { restore: 25 } },
    ingredients: [
      { name: 'Red Herb', count: 1 },
      { name: 'Water Flask', count: 1 }
    ]
  },
  {
    id: 'torch',
    name: 'Torch',
    description: 'Provides light in dark places.',
    result: { name: 'Torch', description: 'A simple wooden torch wrapped in cloth.', icon: '🔥', type: 'misc' },
    ingredients: [
      { name: 'Wood', count: 1 },
      { name: 'Cloth', count: 1 }
    ]
  }
];

export const INITIAL_QUEST = "Find your way to the nearest settlement.";

export const ART_STYLE = "Digital Fantasy Art, detailed, cinematic lighting, masterpiece, 8k resolution, consistent character design, atmospheric";

export const SYSTEM_INSTRUCTION = `
You are an advanced Dungeon Master AI for a Choose-Your-Own-Adventure game. 
Your goal is to generate an immersive story segment based on the user's actions.
You MUST also manage the game state (Inventory, Quests, Health, Gold, Locations, Combat, Lore) logically.

Rules:
1. Story: Write compelling, descriptive narrative (approx 100-150 words). 
2. Choices: Provide 3 distinct, interesting choices for the user.
3. Image Prompt: Create a detailed visual description of the current scene. ALWAYS include the character's visual appearance.
4. State Management: 
   - Handle inventory, quest, health, and gold updates as usual.
   - Loot/Resources: Occasionally reward the player with crafting resources like "Iron Ore", "Leather Scraps", "Wood", "Red Herb", etc.
   - EQUIPMENT: When generating new items, provide a 'type' ('weapon', 'armor', 'consumable', 'material', 'misc') and 'stats' (attack, defense) if applicable.
   - Map: Return 'newLocation' only for SIGNIFICANT new named places.
   - Lore: If the story introduces a SIGNIFICANT new specific character (NPC), faction, historical event, monster type, or magical concept, return it in 'newLore'.

5. COMBAT SYSTEM (CRITICAL):
   - STARTING COMBAT: If the narrative logically leads to a fight, return 'startCombat' with enemy details. Set 'soundEnvironment' to 'battle'.
   - DURING COMBAT: 
     - TACTICAL ENEMY AI: The enemy must NOT just attack blindly. They should REACT to the player's specific action.
       - If player Defends/Blocks: Enemy might attempt a heavy guard-break, use magic, or wait.
       - If player Attacks: Enemy might dodge, parry, or counter-attack.
       - SPECIAL ABILITIES: Give enemies specific named moves.
     - Calculate damage to the Enemy based on the user's action, INVENTORY, and EQUIPPED ITEMS (Context will provide Total Attack/Defense).
     - Calculate damage to the Player (return negative 'healthChange').
     - Return 'combatUpdate' with 'newEnemyHealth', 'status', and 'enemyAction'.
     - choices: MUST include combat actions like "Attack", "Defend", "Use [Item]", "Flee".

Return the response strictly as a JSON object matching the Schema provided.
`;
