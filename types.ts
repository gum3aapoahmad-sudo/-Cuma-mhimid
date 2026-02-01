
export enum EditingMode {
  STANDARD = 'gemini-2.5-flash-image',
  PROFESSIONAL = 'gemini-3-pro-image-preview'
}

export interface ImageState {
  original: string | null;
  history: string[]; // Stack of edited image versions
  historyIndex: number; // Pointer to the current active version in history
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
    // FIX: All declarations of 'aistudio' must have identical modifiers.
    // Properties injected into the global Window object by the environment are typically readonly.
    readonly aistudio: AIStudio;
  }
}

export {};
