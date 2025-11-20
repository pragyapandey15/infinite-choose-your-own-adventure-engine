
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StorySegment, GameState } from "../types";
import { SYSTEM_INSTRUCTION, ART_STYLE } from "../constants";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateStory = async (
  previousNarrative: string,
  userAction: string,
  currentState: GameState
): Promise<StorySegment> => {
  
  const model = "gemini-3-pro-preview";
  
  // Create a summary of locations for context
  const locationContext = currentState.locations
    .map(l => `${l.name} (x:${l.x}, y:${l.y})${l.id === currentState.currentLocationId ? " [CURRENT]" : ""}`)
    .join(", ");

  // Create a summary of discovered lore for context
  const loreContext = currentState.lore ? currentState.lore.map(l => l.name).join(", ") : "None";

  // Stats calculation
  const mainHandAtk = currentState.equipment?.mainHand?.stats?.attack || 0;
  const armorDef = currentState.equipment?.armor?.stats?.defense || 0;
  const totalAttack = mainHandAtk; // Can add base attack later
  const totalDefense = armorDef;

  // Tactical Analysis for AI
  let tacticalAnalysis = "Standard Engagement";
  if (currentState.health < 40) {
    tacticalAnalysis = "PLAYER CRITICAL: Vulnerable to Stun/Finisher";
  } else if (totalDefense >= 4) {
    tacticalAnalysis = "PLAYER ARMORED: Vulnerable to Magic/Poison/DoT (Bypass Defense)";
  } else if (totalAttack >= 8) {
    tacticalAnalysis = "PLAYER HIGH DAMAGE: Requires Debuffs (Blind/Weaken)";
  }

  // Active Effects Context
  const effectsContext = currentState.activeEffects && currentState.activeEffects.length > 0
    ? currentState.activeEffects.map(e => `${e.name} (${e.type}, ${e.duration} turns left): ${e.description}`).join(", ")
    : "None";

  let combatContext = "None";
  if (currentState.combat && currentState.combat.isActive) {
    combatContext = `ACTIVE COMBAT vs ${currentState.combat.enemyName} (HP: ${currentState.combat.enemyHealth}/${currentState.combat.maxHealth})`;
    if (currentState.combat.lastAction) {
      combatContext += `\n    - Last Enemy Move: "${currentState.combat.lastAction}" (Consider this for cooldowns/patterns)`;
    }
  }

  // Format inventory with stats so AI knows what items do
  const inventoryContext = currentState.inventory.map(i => {
    let statsStr = "";
    if (i.stats) {
      const parts = [];
      if (i.stats.attack) parts.push(`Atk: ${i.stats.attack}`);
      if (i.stats.defense) parts.push(`Def: ${i.stats.defense}`);
      if (i.stats.restore) parts.push(`Restore: ${i.stats.restore}`);
      if (parts.length > 0) statsStr = ` [${parts.join(', ')}]`;
    }
    return `${i.name} (${i.type || 'misc'})${statsStr}`;
  }).join(', ');

  const context = `
    Current Game State:
    - Quest: ${currentState.currentQuest}
    - Inventory: ${inventoryContext || "Empty"}
    - EQUIPPED GEAR: Main Hand: ${currentState.equipment?.mainHand?.name || "None"} (Atk: ${mainHandAtk}), Armor: ${currentState.equipment?.armor?.name || "None"} (Def: ${armorDef})
    - TOTAL STATS: Attack: ${totalAttack}, Defense: ${totalDefense}
    - Health: ${currentState.health}
    - Gold: ${currentState.gold}
    - TACTICAL ANALYSIS: ${tacticalAnalysis}
    - ACTIVE STATUS EFFECTS: ${effectsContext} (Apply consequences of these in the narrative if applicable!)
    - Character: ${currentState.characterName} (${currentState.characterClass})
    - Appearance Description: ${currentState.appearance}
    - Known Locations: ${locationContext || "None yet"}
    - Known Lore: ${loreContext}
    - COMBAT STATUS: ${combatContext}
    
    Previous Story Context (Summary):
    ${currentState.history.slice(-3).join('\n')}

    Last Narrative Segment:
    ${previousNarrative}

    User Action:
    ${userAction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: context,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + `\nAdditionally, for the 'soundEnvironment' field, choose one that best fits the atmosphere: 'nature', 'dungeon', 'city', 'battle', or 'mystic'.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short title for this scene" },
            narrative: { type: Type.STRING, description: "The story text" },
            choices: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 suggested actions. If in combat, include Attack/Defend/Flee options."
            },
            imagePrompt: { type: Type.STRING, description: "Visual description for image generation" },
            soundEnvironment: { 
              type: Type.STRING, 
              enum: ['nature', 'dungeon', 'city', 'battle', 'mystic'],
              description: "The auditory atmosphere of the scene."
            },
            newInventoryItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING, description: "A single emoji representing the item" },
                  type: { type: Type.STRING, enum: ['weapon', 'armor', 'consumable', 'material', 'misc'] },
                  stats: {
                    type: Type.OBJECT,
                    properties: {
                      attack: { type: Type.INTEGER },
                      defense: { type: Type.INTEGER },
                      restore: { type: Type.INTEGER }
                    },
                    nullable: true
                  }
                },
                required: ["name", "description", "icon", "type"]
              }
            },
            removedInventoryItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            updatedQuest: { type: Type.STRING },
            healthChange: { type: Type.INTEGER, description: "Negative for damage taken, positive for healing" },
            goldChange: { type: Type.INTEGER },
            newLocation: {
              type: Type.OBJECT,
              description: "Only provide if the user has arrived at a SIGNIFICANT new named location that should appear on the map.",
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                x: { type: Type.INTEGER, description: "0-100 X coordinate" },
                y: { type: Type.INTEGER, description: "0-100 Y coordinate" }
              }
            },
            startCombat: {
              type: Type.OBJECT,
              description: "Return this to initiate a combat encounter.",
              properties: {
                enemyName: { type: Type.STRING },
                health: { type: Type.INTEGER },
                description: { type: Type.STRING }
              }
            },
            combatUpdate: {
              type: Type.OBJECT,
              description: "Return this to update an active combat encounter.",
              properties: {
                newEnemyHealth: { type: Type.INTEGER },
                enemyAction: { type: Type.STRING, description: "The specific move or ability the enemy used this turn." },
                status: { 
                  type: Type.STRING, 
                  enum: ['ongoing', 'victory', 'defeat', 'fled'] 
                }
              }
            },
            newLore: {
              type: Type.ARRAY,
              description: "List of new lore entries discovered in this scene.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Character', 'Faction', 'Location', 'History', 'Bestiary', 'Concept'] },
                  description: { type: Type.STRING, description: "Short concise description of the lore entry." },
                  icon: { type: Type.STRING, description: "An optional emoji" }
                },
                required: ["name", "category", "description"]
              }
            },
            newStatusEffects: {
              type: Type.ARRAY,
              description: "New status effects applied to the player.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  duration: { type: Type.INTEGER },
                  type: { type: Type.STRING, enum: ['buff', 'debuff'] }
                },
                required: ["name", "description", "icon", "duration", "type"]
              }
            },
            removedStatusEffects: {
              type: Type.ARRAY,
              description: "Names of status effects that were cured or removed this turn.",
              items: { type: Type.STRING }
            }
          },
          required: ["title", "narrative", "choices", "imagePrompt"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text) as StorySegment;

  } catch (error) {
    console.error("Error generating story:", error);
    // Fallback
    return {
      title: "The Void",
      narrative: "A mysterious fog rolls in, obscuring your vision. The world seems to pause as the gods (AI) contemplate your fate. Please try again.",
      choices: ["Wait", "Yell out", "Check surroundings"],
      imagePrompt: "A thick mysterious fog in a dark void",
      soundEnvironment: 'mystic'
    };
  }
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  const enhancedPrompt = `${prompt}. Art Style: ${ART_STYLE}`;

  // Attempt 1: Imagen 3 (High Quality)
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
        return `data:image/jpeg;base64,${imageBytes}`;
    }
  } catch (error) {
    console.warn("Imagen 3 quota exceeded or failed, switching to fallback model...", error);
  }

  // Attempt 2: Gemini Flash Image (Fallback)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || 'image/jpeg';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  } catch (error) {
    console.error("All image generation attempts failed:", error);
  }

  return null;
};

export const chatWithGuide = async (
  userMessage: string, 
  currentNarrative: string
): Promise<string> => {
  try {
    // Using Flash Lite for fast responses as requested
    const model = "gemini-flash-lite-latest"; 
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `
        Context: The user is playing a text adventure.
        Current Scene Narrative: "${currentNarrative}"
        User Question: "${userMessage}"
        
        Answer the user's question briefly and helpfully, acting as a mysterious guide or inner voice. Do not spoil future events.
      `,
    });
    
    return response.text || "The spirits are silent.";
  } catch (error) {
    console.error("Error in chat:", error);
    return "I cannot answer that right now.";
  }
};
