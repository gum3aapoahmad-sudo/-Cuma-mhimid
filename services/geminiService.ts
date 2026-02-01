
import { GoogleGenAI } from "@google/genai";
import { EditingMode } from "../types";

export const processImage = async (
  base64Image: string,
  prompt: string,
  mode: EditingMode = EditingMode.STANDARD
): Promise<string> => {
  // Create a new instance right before the call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Check if prompt asks for 4K specifically to adjust imageSize config
  const is4KRequest = prompt.toLowerCase().includes("4k") || prompt.toLowerCase().includes("ultra high");

  try {
    const response = await ai.models.generateContent({
      model: mode,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png'
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: mode === EditingMode.PROFESSIONAL ? {
        imageConfig: {
          aspectRatio: "3:4", // Closest standard ratio (0.75) to user's 23.5x29.5cm (0.79)
          imageSize: is4KRequest ? "4K" : "1K"
        }
      } : undefined
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No response from AI model");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in AI response");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }
};
