"use client";

import {
  emptyModifierSelection,
  MODIFIER_GROUPS,
  type ModifierGroupId,
  type ModifierSelection,
} from "./modifier-options";

const KEY = "arch_magic_modifiers_v1";

const VALID_GROUPS = new Set<ModifierGroupId>(
  MODIFIER_GROUPS.map((g) => g.id)
);
const VALID_OPTION_IDS: Record<ModifierGroupId, Set<string>> =
  MODIFIER_GROUPS.reduce(
    (acc, g) => {
      acc[g.id] = new Set(g.options.map((o) => o.id));
      return acc;
    },
    {} as Record<ModifierGroupId, Set<string>>
  );

export function loadModifiers(): ModifierSelection {
  if (typeof window === "undefined") return emptyModifierSelection();
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return emptyModifierSelection();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyModifierSelection();
    const result: ModifierSelection = {};
    for (const [k, v] of Object.entries(parsed)) {
      const group = k as ModifierGroupId;
      if (!VALID_GROUPS.has(group)) continue;
      if (!Array.isArray(v)) continue;
      const filtered = v.filter(
        (id): id is string => typeof id === "string" && VALID_OPTION_IDS[group].has(id)
      );
      if (filtered.length > 0) result[group] = filtered;
    }
    return result;
  } catch {
    return emptyModifierSelection();
  }
}

export function saveModifiers(selection: ModifierSelection): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(selection));
  } catch {
    /* ignore */
  }
}

export function clearAllModifiers(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
