"use client";

import type { AppSettings, Engine, HistoryEntry } from "./types";

const HISTORY_KEY = "arch_magic_history_v1";
const SETTINGS_KEY = "arch_magic_settings_v1";
const WELCOME_KEY = "welcome_shown_v1";
const MAX_HISTORY = 30;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const current = getHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* quota — ignore */
  }
  return next;
}

export function deleteHistory(id: string): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const next = getHistory().filter((h) => h.id !== id);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function getSettings(): AppSettings {
  const fallback: AppSettings = { engine: "midjourney" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const engine: Engine =
      parsed.engine === "stable-diffusion" ? "stable-diffusion" : "midjourney";
    return { engine };
  } catch {
    return fallback;
  }
}

export function setSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function isWelcomeShown(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return true;
  }
}

export function markWelcomeShown(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WELCOME_KEY, "1");
  } catch {
    /* ignore */
  }
}
