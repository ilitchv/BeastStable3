
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
        // FIX: Improved prompt for better accuracy.
        text: 'Analyze the provided lottery ticket image. Identify each individual play. For every play, extract the following details: the bet number (e.g., "123", "4567", "12-34"), the amount wagered for "straight", the amount for "box", and the amount for "combo". If a specific wager type (straight, box, combo) is not present for a play, its value should be 0.'
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
                                description: "The number being bet (e.g., '123', '4567', '23-56'). This is the most critical piece of information."
                            },
                            straightAmount: {
                                type: Type.NUMBER,
                                // FIX: Improved description for better AI guidance.
                                description: "The dollar amount for a 'straight' bet (exact order). Look for numbers next to the bet number or under a 'straight' column. Default to 0 if not found."
                            },
                            boxAmount: {
                                type: Type.NUMBER,
                                // FIX: Improved description for better AI guidance.
                                description: "The dollar amount for a 'box' bet (any order). Look for the word 'box' or a 'box' column. Default to 0 if not found."
                            },
                            comboAmount: {
                                type: Type.NUMBER,
                                // FIX: Improved description for better AI guidance.
                                description: "The dollar amount for a 'combo' bet (all permutations). Look for 'combo' or 'com'. Default to 0 if not found."
                            }
                        }
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);

        if (!Array.isArray(parsedData)) {
            console.error("AI response was not an array:", parsedData);
            throw new Error("AI response was not in the expected array format.");
        }

        const results: OcrResult[] = parsedData
            .filter(item => item && typeof item.betNumber === 'string' && item.betNumber.trim() !== '') // Filter out empty or invalid entries
            .map(item => ({
                betNumber: item.betNumber || '',
                straightAmount: item.straightAmount > 0 ? item.straightAmount : null,
                boxAmount: item.boxAmount > 0 ? item.boxAmount : null,
                comboAmount: item.comboAmount > 0 ? item.comboAmount : null,
            }));
        
        imageCache.set(base64Image, results);
        return results;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        let errorMessage = "Failed to interpret the ticket image. The AI service may be temporarily unavailable.";
        if (error instanceof Error && error.message.includes('JSON')) {
            errorMessage = "The AI returned an invalid format. Please try again with a clearer image."
        }
        throw new Error(errorMessage);
    }
};

export const interpretNaturalLanguagePlays = async (prompt: string): Promise<OcrResult[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are an expert lottery ticket assistant. Your task is to analyze the user's text and extract all lottery plays. The user might use slang or abbreviations.
                - "ponle 5 straight y 10 box al 123" means a $5 straight bet and a $10 box bet on the number 123.
                - "2 dolares combo en el 4567" means a $2 combo bet on 4567.
                - "1 peso al 45" means a $1 straight bet on the number 45.
                Extract the bet number, straight amount, box amount, and combo amount for each play.
                If an amount is not specified for a type of bet, its value should be 0.
                Only respond with the JSON array. Do not include any other text or markdown formatting.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            betNumber: { type: Type.STRING, description: "The number being bet (e.g., '123', '4567')." },
                            straightAmount: { type: Type.NUMBER, description: "The dollar amount for a 'straight' bet. Default to 0 if not found." },
                            boxAmount: { type: Type.NUMBER, description: "The dollar amount for a 'box' bet. Default to 0 if not found." },
                            comboAmount: { type: Type.NUMBER, description: "The dollar amount for a 'combo' bet. Default to 0 if not found." }
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

        return parsedData
            .filter(item => item && typeof item.betNumber === 'string' && item.betNumber.trim() !== '')
            .map(item => ({
                betNumber: item.betNumber || '',
                straightAmount: item.straightAmount > 0 ? item.straightAmount : null,
                boxAmount: item.boxAmount > 0 ? item.boxAmount : null,
                comboAmount: item.comboAmount > 0 ? item.comboAmount : null,
            }));

    } catch (error) {
        console.error("Error calling Gemini API for natural language processing:", error);
        let errorMessage = "Failed to interpret your request. The AI service may be temporarily unavailable.";
        if (error instanceof Error && error.message.includes('JSON')) {
            errorMessage = "The AI returned an invalid format. Please try rephrasing your request."
        }
        throw new Error(errorMessage);
    }
};
