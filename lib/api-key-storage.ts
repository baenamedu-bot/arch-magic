"use client";

const KEY = "gemini_api_key";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setApiKey(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, value.trim());
  } catch {
    /* ignore */
  }
}

export function clearApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasApiKey(): boolean {
  const v = getApiKey();
  return !!v && v.length > 8;
}
