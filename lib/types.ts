export type Engine = "midjourney" | "stable-diffusion";

export interface PromptCard {
  id: string;
  styleLabel: string;
  styleLabelKo: string;
  intentKo: string;
  promptOnly: string;
  promptFull: string;
  parameters?: string;
  negative?: string;
}

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
