"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EngineToggle } from "./engine-toggle";
import type { Engine } from "@/lib/types";

const SAMPLES = [
  "노출 콘크리트의 미니멀리즘",
  "강화도 해변의 카페",
  "제주도 돌담 느낌의 현대적 펜션",
  "한옥 처마와 미스 반 데어 로에의 만남",
  "지속가능한 도심 속 작은 도서관",
];

interface Props {
  concept: string;
  onConceptChange: (v: string) => void;
  engine: Engine;
  onEngineChange: (e: Engine) => void;
  loading: boolean;
  onGenerate: () => void;
}

export function ConceptForm({
  concept,
  onConceptChange,
  engine,
  onEngineChange,
  loading,
  onGenerate,
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="concept">건축 컨셉 (한글)</Label>
        <Textarea
          id="concept"
          value={concept}
          onChange={(e) => onConceptChange(e.target.value)}
          placeholder="예) 노출 콘크리트의 미니멀리즘, 강화도 해변의 카페, 제주 돌담 느낌의 현대적 펜션…"
          maxLength={400}
          disabled={loading}
          className="min-h-[110px] text-[15px]"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              onGenerate();
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
          <span className="text-[11px] text-muted-foreground">예시:</span>
          {SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading}
              onClick={() => onConceptChange(s)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>타깃 엔진</Label>
        <EngineToggle value={engine} onChange={onEngineChange} disabled={loading} />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading || concept.trim().length < 2}
        className="w-full"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.25} />
        {loading ? "5장 카드 생성 중…" : "프롬프트 5종 생성"}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        ⌘/Ctrl + Enter 로도 빠르게 생성할 수 있습니다.
      </p>
    </form>
  );
}
