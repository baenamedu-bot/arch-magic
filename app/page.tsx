"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ConceptForm } from "@/components/prompt/concept-form";
import { PromptGrid } from "@/components/prompt/prompt-grid";
import { Disclaimer } from "@/components/prompt/disclaimer";
import { ComparisonHint } from "@/components/compare/comparison-panel";
import { useApiKeyModal } from "@/components/settings/api-key-context";
import { useCompare } from "@/components/compare/compare-context";
import { Badge } from "@/components/ui/badge";
import { hasApiKey, getApiKey } from "@/lib/api-key-storage";
import {
  getSettings,
  pushHistory,
  setSettings as saveSettings,
} from "@/lib/history-storage";
import { generatePromptCards, GeminiError } from "@/lib/gemini-client";
import type { Engine, PromptCard } from "@/lib/types";
import { ENGINE_LABEL } from "@/lib/types";
import {
  emptyModifierSelection,
  countSelected,
  type ModifierSelection,
} from "@/lib/modifier-options";
import { loadModifiers, saveModifiers } from "@/lib/modifier-storage";

export default function HomePage() {
  const { openApiKeyModal, apiKeyVersion } = useApiKeyModal();
  const { clear: clearCompare } = useCompare();

  const [concept, setConcept] = useState("");
  const [engine, setEngine] = useState<Engine>("midjourney");
  const [modifiers, setModifiers] = useState<ModifierSelection>(
    emptyModifierSelection
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<PromptCard[]>([]);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setEngine(s.engine);
    setModifiers(loadModifiers());
  }, []);

  function handleEngineChange(next: Engine) {
    setEngine(next);
    saveSettings({ engine: next });
  }

  function handleModifiersChange(next: ModifierSelection) {
    setModifiers(next);
    saveModifiers(next);
  }

  async function handleGenerate() {
    setError(null);
    if (concept.trim().length < 2) {
      toast.error("컨셉을 조금 더 자세히 입력해 주세요.");
      return;
    }
    if (!hasApiKey()) {
      toast.message("Gemini API 키가 필요합니다", {
        description: "우측 상단 ⚙️ 또는 안내 모달에서 키를 먼저 입력해 주세요.",
      });
      openApiKeyModal();
      return;
    }

    const apiKey = getApiKey()!;
    setLoading(true);
    setCards([]);
    setHasResult(true);
    clearCompare();
    try {
      const result = await generatePromptCards({
        apiKey,
        conceptKo: concept.trim(),
        engine,
        modifiers,
      });
      setCards(result);
      pushHistory({
        id: `h_${Date.now()}`,
        conceptKo: concept.trim(),
        engine,
        cards: result,
        createdAt: Date.now(),
      });
      toast.success("프롬프트 5종을 생성했습니다", {
        description: "히스토리에 자동 저장되었습니다.",
      });
    } catch (err) {
      const msg =
        err instanceof GeminiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
      setError(msg);
      if (err instanceof GeminiError && (err.code === "NO_KEY" || err.code === "INVALID_KEY")) {
        openApiKeyModal();
      }
    } finally {
      setLoading(false);
    }
  }

  // Re-validate after key save: if user saves key from modal, retry guidance hint
  useEffect(() => {
    if (apiKeyVersion > 0 && hasApiKey() && error) {
      // Auto-clear "no key" style error so retry button is more obvious
      if (error.includes("API 키")) setError(null);
    }
  }, [apiKeyVersion, error]);

  return (
    <div className="container max-w-6xl py-10 sm:py-14">
      {/* Hero */}
      <section className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
        <Badge variant="muted" className="mb-4">
          <Sparkles className="h-3 w-3" strokeWidth={2.25} />
          Gemini 2.5 Flash · BYOK
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
          한글 건축 컨셉을, <br className="sm:hidden" />
          AI 프롬프트 5종으로
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed text-pretty">
          컨셉 한 줄을 입력하면, {ENGINE_LABEL[engine]}에서 바로 쓸 수 있는
          영문 프롬프트 5종을 동시에 생성합니다. 재질·공간감·조명·카메라 4요소가
          모든 카드에 포함됩니다.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto">
        <ConceptForm
          concept={concept}
          onConceptChange={setConcept}
          engine={engine}
          onEngineChange={handleEngineChange}
          modifiers={modifiers}
          onModifiersChange={handleModifiersChange}
          loading={loading}
          onGenerate={handleGenerate}
        />
      </section>

      {/* Results */}
      {(loading || error || cards.length > 0) && (
        <section className="mt-12 sm:mt-16">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                생성된 프롬프트
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                타깃 엔진 · {ENGINE_LABEL[engine]}
                {countSelected(modifiers) > 0 && (
                  <>
                    <span className="mx-1.5 text-muted-foreground/50">·</span>
                    빠른 옵션 {countSelected(modifiers)}개 적용
                  </>
                )}
              </p>
            </div>
            {cards.length > 0 && (
              <Badge variant="outline">
                {cards.length} / 5 카드
              </Badge>
            )}
          </div>
          <PromptGrid
            loading={loading}
            error={error}
            cards={cards}
            engine={engine}
            conceptKo={concept.trim()}
            onRetry={handleGenerate}
          />
          {cards.length > 0 && <ComparisonHint />}
          {(cards.length > 0 || (!loading && !error && hasResult)) && <Disclaimer />}
        </section>
      )}
    </div>
  );
}
