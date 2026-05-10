export type Engine = "midjourney" | "stable-diffusion";

export interface CardElements {
  materiality?: string;
  spatial?: string;
  lighting?: string;
  camera?: string;
}

export type ElementKey = keyof CardElements;

export interface PromptCard {
  id: string;
  styleLabel: string;
  styleLabelKo: string;
  intentKo: string;
  promptOnly: string;
  promptFull: string;
  parameters?: string;
  negative?: string;
  /** Short Korean one-liners for the side-by-side comparison panel. */
  elements?: CardElements;
}

export const ELEMENT_LABEL: Record<ElementKey, string> = {
  materiality: "재질",
  spatial: "공간감",
  lighting: "조명",
  camera: "카메라",
};

export const ELEMENT_ORDER: ElementKey[] = [
  "materiality",
  "spatial",
  "lighting",
  "camera",
];

export interface HistoryEntry {
  id: string;
  conceptKo: string;
  engine: Engine;
  cards: PromptCard[];
  createdAt: number;
}

export interface AppSettings {
  engine: Engine;
}

export interface FavoriteEntry {
  id: string;
  card: PromptCard;
  conceptKo: string;
  engine: Engine;
  savedAt: number;
}

export const ENGINE_LABEL: Record<Engine, string> = {
  midjourney: "Midjourney V8.1",
  "stable-diffusion": "Stable Diffusion",
};

export const ENGINE_LABEL_SHORT: Record<Engine, string> = {
  midjourney: "MJ",
  "stable-diffusion": "SD",
};
