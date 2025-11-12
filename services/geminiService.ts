import { GoogleGenAI, Type } from "@google/genai";
import type { OcrResult } from '../types';

// Do not overuse this. This is a simple cache to avoid re-processing the same image.
const imageCache = new Map<string, OcrResult[]>();

export const interpretTicketImage = async (base64Image: string): Promise<OcrResult[]> => {
    if (imageCache.has(base64Image)) {
        return imageCache.get(base64Image)!;
    }

    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: 'Extract all the lottery plays from this ticket. For each distinct play, provide the bet number and the amounts for straight, box, or combo wagers. If a wager type is not present for a play, return 0 for its amount.'
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            betNumber: {
                                type: Type.STRING,
                                description: "The number being bet (e.g., '123', '4567', '23-56')."
                            },
                            straightAmount: {
                                type: Type.NUMBER,
                                description: "The wager amount for a 'straight' bet (exact order). This is the most common single wager. Look for abbreviations like 'str' or 'straight'. Return 0 if not present."
                            },
                            boxAmount: {
                                type: Type.NUMBER,
                                description: "The wager amount for a 'box' bet (any order). Look for the word 'box'. Return 0 if not present."
                            },
                            comboAmount: {
                                type: Type.NUMBER,
                                description: "The wager amount for a 'combo' bet (all permutations). Look for abbreviations like 'com' or 'combo'. This is less common. Return 0 if not present."
                            }
                        }
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);

        if (!Array.isArray(parsedData)) {
            throw new Error("AI response was not in the expected array format.");
        }

        const results: OcrResult[] = parsedData.map(item => ({
            betNumber: item.betNumber || '',
            straightAmount: item.straightAmount > 0 ? item.straightAmount : null,
            boxAmount: item.boxAmount > 0 ? item.boxAmount : null,
            comboAmount: item.comboAmount > 0 ? item.comboAmount : null,
        }));
        
        imageCache.set(base64Image, results);
        return results;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to interpret the ticket image. The AI service may be temporarily unavailable.");
    }
};
