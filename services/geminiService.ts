import { GoogleGenAI, Type } from "@google/genai";
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

  const context = `
    Current Game State:
    - Quest: ${currentState.currentQuest}
    - Inventory: ${currentState.inventory.map(i => i.name).join(', ')}
    - Health: ${currentState.health}
    - Gold: ${currentState.gold}
    - Character: ${currentState.characterName} (${currentState.characterClass})
    - Appearance Description: ${currentState.appearance}
    - Known Locations: ${locationContext || "None yet"}
    
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
              description: "3 suggested actions"
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
                  icon: { type: Type.STRING, description: "A single emoji representing the item" }
                }
              }
            },
            removedInventoryItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            updatedQuest: { type: Type.STRING },
            healthChange: { type: Type.INTEGER },
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
  try {
    const enhancedPrompt = `${prompt}. Art Style: ${ART_STYLE}`;
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
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
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