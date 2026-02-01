
import { GoogleGenAI } from "@google/genai";
import { EditingMode } from "../types";

export const processImage = async (
  base64Image: string,
  prompt: string,
  mode: EditingMode = EditingMode.STANDARD
): Promise<string> => {
  // Create a new instance right before the call to ensure it always uses the most up-to-date API key.
  // Using process.env.API_KEY directly in the constructor as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // For Image editing we use generateContent with the image part
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
          aspectRatio: "3:4", // Optimized for vertical fashion prints
          imageSize: "1K"
        }
      } : undefined
    });

    // Iterate through candidates and parts to find the image
    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No response from AI model");

    // Iterate through all parts to find the image data, as the response may contain text or other parts.
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in AI response");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      // This is the specific error signal to prompt for key selection when using paid models.
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }
};
