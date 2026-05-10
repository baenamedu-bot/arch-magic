"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import type { Engine, PromptCard } from "@/lib/types";

export interface CompareEntry {
  card: PromptCard;
  engine: Engine;
  conceptKo: string;
  /** Display index (1-based) at selection time, used for "01·02·03" labels. */
  index: number;
}

const MAX_SLOTS = 3;

interface CompareContextValue {
  entries: CompareEntry[];
  count: number;
  isSelected: (cardId: string) => boolean;
  toggle: (entry: CompareEntry) => void;
  clear: () => void;
  remove: (cardId: string) => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CompareEntry[]>([]);

  const isSelected = useCallback(
    (cardId: string) => entries.some((e) => e.card.id === cardId),
    [entries]
  );

  const toggle = useCallback<CompareContextValue["toggle"]>(
    (entry) => {
      setEntries((prev) => {
        const exists = prev.find((e) => e.card.id === entry.card.id);
        if (exists) {
          return prev.filter((e) => e.card.id !== entry.card.id);
        }
        if (prev.length >= MAX_SLOTS) {
          const dropped = prev[0];
          toast.message("최대 3장까지 비교 가능", {
            description: `먼저 선택한 "${dropped.card.styleLabel}"이 자동 해제되었습니다.`,
          });
          return [...prev.slice(1), entry];
        }
        return [...prev, entry];
      });
    },
    []
  );

  const remove = useCallback((cardId: string) => {
    setEntries((prev) => prev.filter((e) => e.card.id !== cardId));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      entries,
      count: entries.length,
      isSelected,
      toggle,
      clear,
      remove,
    }),
    [entries, isSelected, toggle, clear, remove]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
