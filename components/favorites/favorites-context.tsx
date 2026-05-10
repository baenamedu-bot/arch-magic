"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  addFavorite,
  isFavoritedById,
  loadFavorites,
  removeFavoriteByCardId,
} from "@/lib/favorites-storage";
import type { Engine, FavoriteEntry, PromptCard } from "@/lib/types";

interface FavoritesContextValue {
  favorites: FavoriteEntry[];
  count: number;
  isFavorited: (cardId: string) => boolean;
  toggleFavorite: (input: {
    card: PromptCard;
    conceptKo: string;
    engine: Engine;
  }) => void;
  refresh: () => void;
  setFavorites: (next: FavoriteEntry[]) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavoritesState] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    setFavoritesState(loadFavorites());
  }, []);

  // Keep multiple tabs in sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "arch_magic_favorites_v1") {
        setFavoritesState(loadFavorites());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorited = useCallback(
    (cardId: string) => isFavoritedById(favorites, cardId),
    [favorites]
  );

  const toggleFavorite = useCallback<FavoritesContextValue["toggleFavorite"]>(
    ({ card, conceptKo, engine }) => {
      if (isFavoritedById(favorites, card.id)) {
        const next = removeFavoriteByCardId(card.id);
        setFavoritesState(next);
        toast.success("즐겨찾기에서 제거했습니다.");
      } else {
        const entry: FavoriteEntry = {
          id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          card,
          conceptKo,
          engine,
          savedAt: Date.now(),
        };
        const next = addFavorite(entry);
        setFavoritesState(next);
        toast.success("즐겨찾기에 저장했습니다.");
      }
    },
    [favorites]
  );

  const refresh = useCallback(() => {
    setFavoritesState(loadFavorites());
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      count: favorites.length,
      isFavorited,
      toggleFavorite,
      refresh,
      setFavorites: setFavoritesState,
    }),
    [favorites, isFavorited, toggleFavorite, refresh]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
