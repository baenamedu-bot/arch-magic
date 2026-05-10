"use client";

import type { FavoriteEntry } from "./types";

const KEY = "arch_magic_favorites_v1";
const MAX = 200;

export function loadFavorites(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FavoriteEntry[];
  } catch {
    return [];
  }
}

function persist(entries: FavoriteEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* quota — ignore */
  }
}

export function isFavoritedById(entries: FavoriteEntry[], cardId: string): boolean {
  return entries.some((e) => e.card.id === cardId);
}

export function addFavorite(entry: FavoriteEntry): FavoriteEntry[] {
  const current = loadFavorites();
  if (isFavoritedById(current, entry.card.id)) return current;
  const next = [entry, ...current].slice(0, MAX);
  persist(next);
  return next;
}

export function removeFavoriteByCardId(cardId: string): FavoriteEntry[] {
  const next = loadFavorites().filter((e) => e.card.id !== cardId);
  persist(next);
  return next;
}

export function removeFavoriteById(id: string): FavoriteEntry[] {
  const next = loadFavorites().filter((e) => e.id !== id);
  persist(next);
  return next;
}

export function removeFavoritesByIds(ids: string[]): FavoriteEntry[] {
  const set = new Set(ids);
  const next = loadFavorites().filter((e) => !set.has(e.id));
  persist(next);
  return next;
}

export function clearFavorites(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
