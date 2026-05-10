"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ApiKeyModal } from "./api-key-modal";

interface ApiKeyContextValue {
  openApiKeyModal: () => void;
  /** Increments when a key is saved — components can subscribe to refresh */
  apiKeyVersion: number;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0);

  const openApiKeyModal = useCallback(() => setOpen(true), []);
  const handleSaved = useCallback(() => setVersion((v) => v + 1), []);

  return (
    <ApiKeyContext.Provider value={{ openApiKeyModal, apiKeyVersion: version }}>
      {children}
      <ApiKeyModal open={open} onOpenChange={setOpen} onSaved={handleSaved} />
    </ApiKeyContext.Provider>
  );
}

export function useApiKeyModal() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKeyModal must be used within ApiKeyProvider");
  return ctx;
}
