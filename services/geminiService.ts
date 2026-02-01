
import { GoogleGenAI } from "@google/genai";
import { EditingMode } from "../types";

export const processImage = async (
  base64Image: string,
  prompt: string,
  mode: EditingMode = EditingMode.STANDARD
): Promise<string> => {
  // Create a new instance right before the call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
          aspectRatio: "3:4", // Closest standard ratio to 23.5 x 29.5 cm print size
          imageSize: "1K"     // Optimized for high quality detail
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
