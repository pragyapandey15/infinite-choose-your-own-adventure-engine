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
You MUST also manage the game state (Inventory, Quests, Health, Gold, Locations) logically.

Rules:
1. Story: Write compelling, descriptive narrative (approx 100-150 words). 
2. Choices: Provide 3 distinct, interesting choices for the user.
3. Image Prompt: Create a detailed visual description of the current scene for an image generator. 
   - Focus on the environment and action.
   - ALWAYS include the character's visual appearance in the prompt to maintain consistency.
   - Do NOT include text in the description.
4. State Management: 
   - If the user finds an item, add it to 'newInventoryItems'.
   - If the user uses/loses an item, add its name to 'removedInventoryItems'.
   - If the plot advances significantly, update 'updatedQuest'.
   - Adjust 'healthChange' (negative for damage, positive for healing) and 'goldChange' appropriately.
5. World Building (Map):
   - When the story moves to a NEW, distinct named location (e.g., "The Whispering Woods", "Ironhold Keep"), return a 'newLocation' object.
   - 'x' and 'y' are coordinates from 0 to 100 representing the map position. 
   - Keep coordinates logical (e.g., if walking North, Y decreases. If walking East, X increases). 
   - The starting point is usually around 50, 50.
   - Do not create a new location if the user is just moving within the same general area.

Return the response strictly as a JSON object matching the Schema provided.
`;