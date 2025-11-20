
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
    id: 'reinforced-shield',
    name: 'Reinforced Shield',
    description: 'A wooden shield reinforced with iron bands.',
    result: { name: 'Reinforced Shield', description: 'Heavy but offers great protection.', icon: '🛡️', type: 'armor', stats: { defense: 8 } },
    ingredients: [
      { name: 'Wood', count: 2 },
      { name: 'Iron Ore', count: 2 }
    ]
  },
  {
    id: 'obsidian-dagger',
    name: 'Obsidian Dagger',
    description: 'A blade of volcanic glass, incredibly sharp.',
    result: { name: 'Obsidian Dagger', description: 'Glints with a dark, purple sheen.', icon: '🗡️', type: 'weapon', stats: { attack: 15 } },
    ingredients: [
      { name: 'Obsidian Shard', count: 1 },
      { name: 'Leather Scraps', count: 1 },
      { name: 'Iron Ore', count: 1 }
    ]
  },
  {
    id: 'mage-hood',
    name: 'Mage\'s Hood',
    description: 'Imbued with residual magic dust.',
    result: { name: 'Mage Hood', description: 'Weaves protective spells around the wearer.', icon: '🧙‍♀️', type: 'armor', stats: { defense: 5 } },
    ingredients: [
      { name: 'Cloth', count: 2 },
      { name: 'Magic Dust', count: 1 }
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
    id: 'elixir-vitality',
    name: 'Elixir of Vitality',
    description: 'A potent brew that knits wounds instantly.',
    result: { name: 'Elixir of Vitality', description: 'Glowing golden liquid.', icon: '⚗️', type: 'consumable', stats: { restore: 60 } },
    ingredients: [
      { name: 'Red Herb', count: 3 },
      { name: 'Magic Dust', count: 1 }
    ]
  },
  {
    id: 'antidote',
    name: 'Antidote',
    description: 'Cures poisons and toxins.',
    result: { name: 'Antidote', description: 'A small vial of clear green liquid.', icon: '🍵', type: 'consumable', stats: { restore: 5 } },
    ingredients: [
      { name: 'Green Herb', count: 1 },
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
You MUST also manage the game state (Inventory, Quests, Health, Gold, Locations, Combat, Lore, Status Effects) logically.

Rules:
1. Story: Write compelling, descriptive narrative (approx 100-150 words). 
2. Choices: Provide 3 distinct, interesting choices for the user.
3. Image Prompt: Create a detailed visual description of the current scene. ALWAYS include the character's visual appearance.
4. State Management: 
   - Handle inventory, quest, health, and gold updates as usual.
   - Loot/Resources: Occasionally reward the player with crafting resources. Common: "Iron Ore", "Leather Scraps", "Wood", "Red Herb", "Cloth", "Water Flask". Rare: "Magic Dust", "Obsidian Shard", "Green Herb", "Crystal Shard".
   - EQUIPMENT (CRITICAL): 
     - When generating new items, you MUST provide a 'type' ('weapon', 'armor', 'consumable', 'material', 'misc').
     - IF 'weapon': You MUST include 'stats' with an 'attack' value (e.g., { attack: 12 }).
     - IF 'armor': You MUST include 'stats' with a 'defense' value (e.g., { defense: 5 }).
     - IF 'consumable': You MUST include 'stats' with a 'restore' value (e.g., { restore: 25 }) if it heals.
   - Map: Return 'newLocation' only for SIGNIFICANT new named places.
   - Lore: If the story introduces a SIGNIFICANT new specific character (NPC), faction, historical event, monster type, or magical concept, return it in 'newLore'.

5. COMBAT SYSTEM:
   - STARTING COMBAT: If the narrative logically leads to a fight, return 'startCombat' with enemy details. Set 'soundEnvironment' to 'battle'.
   - DURING COMBAT: 
     - TACTICAL ENEMY AI: The enemy must act STRATEGICALLY based on the player's state (see Context).
       - IF PLAYER HEALTH IS LOW (< 30%): The enemy attempts to STUN 💫, FREEZE ❄️, or TRAP the player to prevent healing/escape.
       - IF PLAYER DEFENSE IS HIGH (High Armor/Shield): The enemy uses MAGIC, PIERCING, or DAMAGE-OVER-TIME effects (Poison ☠️, Burn 🔥, Bleed 🩸) to bypass defense.
       - IF PLAYER ATTACK IS HIGH: The enemy uses DEBUFFS (Blind 👁️‍🗨️, Weaken 📉) or EVASION tactics.
       - REACTION: The enemy should also react to the player's specific last move (e.g., Guard Break if player Blocked).
     - STATUS EFFECTS:
       - Return new effects in 'newStatusEffects'.
       - ALWAYS provide a clear emoji 'icon'.
       - Set 'duration' between 1-3 turns usually.
       - If the player ALREADY has active effects (check context), you MUST apply their consequences (e.g., "The poison burns your veins (-5 HP)") in the narrative and 'healthChange'.
     - Calculate damage to the Enemy based on the user's action, INVENTORY (including potions), and EQUIPPED ITEMS.
     - Calculate damage to the Player based on enemy strength vs Player Defense.
     - Provide a 'combatUpdate' object with the new state.
     - Describe the exchange vividly in the 'narrative'.
`;
