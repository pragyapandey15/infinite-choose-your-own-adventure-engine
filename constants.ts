import { InventoryItem } from './types';

export const CLASS_LOADOUTS: Record<string, { inventory: InventoryItem[], health: number, gold: number, description: string, icon: string }> = {
  Warrior: {
    inventory: [
      { name: "Rusty Sword", description: "Reliable steel.", icon: "⚔️" },
      { name: "Wooden Shield", description: "Splintered but sturdy.", icon: "🛡️" }
    ],
    health: 120,
    gold: 10,
    description: "A master of arms and armor, built for the front lines.",
    icon: "⚔️"
  },
  Mage: {
    inventory: [
      { name: "Gnarled Staff", description: "Hums with faint energy.", icon: "🔮" },
      { name: "Mana Potion", description: "Blue and bubbling.", icon: "🧪" }
    ],
    health: 70,
    gold: 30,
    description: "A scholar of the arcane, wielding destructive magic.",
    icon: "🔮"
  },
  Rogue: {
    inventory: [
      { name: "Twin Daggers", description: "Sharp and concealable.", icon: "🗡️" },
      { name: "Thieves Tools", description: "For opening closed doors.", icon: "🗝️" }
    ],
    health: 90,
    gold: 50,
    description: "A shadow in the night, skilled in stealth and trickery.",
    icon: "🗡️"
  }
};

export const INITIAL_QUEST = "Find your way to the nearest settlement.";

export const ART_STYLE = "Digital Fantasy Art, detailed, cinematic lighting, masterpiece, 8k resolution, consistent character design, atmospheric";

export const SYSTEM_INSTRUCTION = `
You are an advanced Dungeon Master AI for a Choose-Your-Own-Adventure game. 
Your goal is to generate an immersive story segment based on the user's actions.
You MUST also manage the game state (Inventory, Quests, Health, Gold, Locations, Combat) logically.

Rules:
1. Story: Write compelling, descriptive narrative (approx 100-150 words). 
2. Choices: Provide 3 distinct, interesting choices for the user.
3. Image Prompt: Create a detailed visual description of the current scene. ALWAYS include the character's visual appearance.
4. State Management: 
   - Handle inventory, quest, health, and gold updates as usual.
   - Map: Return 'newLocation' only for SIGNIFICANT new named places.

5. COMBAT SYSTEM (CRITICAL):
   - STARTING COMBAT: If the narrative logically leads to a fight, return 'startCombat' with enemy details. Set 'soundEnvironment' to 'battle'.
   - DURING COMBAT: 
     - The context will show 'Current Combat Status'.
     - Calculate damage to the Enemy based on the user's action and inventory (e.g., sword deals more than fists).
     - Calculate damage to the Player (return negative 'healthChange').
     - Return 'combatUpdate' with the 'newEnemyHealth' and 'status'.
     - 'status': 'ongoing' (fight continues), 'victory' (enemy dies), 'defeat' (player dies), 'fled' (player escaped).
     - If 'victory', provide loot in 'newInventoryItems' and reset 'soundEnvironment' to normal.
     - choices: MUST include combat actions like "Attack", "Defend", "Use [Item]", "Flee".

Return the response strictly as a JSON object matching the Schema provided.
`;