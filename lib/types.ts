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

export const ENGINE_LABEL: Record<Engine, string> = {
  midjourney: "Midjourney V8.1",
  "stable-diffusion": "Stable Diffusion",
};
