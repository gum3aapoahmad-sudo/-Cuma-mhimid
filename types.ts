

export enum EditingMode {
  STANDARD = 'gemini-2.5-flash-image',
  PROFESSIONAL = 'gemini-3-pro-image-preview'
}

export interface ImageState {
  original: string | null;
  edited: string | null;
  isProcessing: boolean;
  error: string | null;
}

export interface Preset {
  id: string;
  name: string;
  nameAr: string;
  descriptionAr: string;
  prompt: string;
  icon: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  userName: string;
  date: string;
  likes: number;
}

// Define the shape of AIStudio to match the global type if it exists or provide a definition for it.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Removed readonly modifier to fix the "All declarations of 'aistudio' must have identical modifiers" error.
    // This ensures consistency with the underlying environment's definition of window.aistudio.
    aistudio: AIStudio;
  }
}

export {};
