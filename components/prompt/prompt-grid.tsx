"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptCard } from "./prompt-card";
import type { Engine, PromptCard as PromptCardType } from "@/lib/types";

interface Props {
  loading: boolean;
  error: string | null;
  cards: PromptCardType[];
  engine: Engine;
  onRetry: () => void;
}

function SkeletonCard({ index }: { index: number }) {
  const delays = ["delay-card-0", "delay-card-1", "delay-card-2", "delay-card-3", "delay-card-4"];
  return (
    <Card
      className={`animate-fade-in-up ${delays[Math.min(index, 4)]} flex flex-col overflow-hidden`}
    >
      <div className="border-b border-border bg-muted/40 px-5 py-3.5 space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex-1 p-5 space-y-2.5">
        <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-[92%] rounded bg-muted animate-pulse" />
        <div className="h-3 w-[78%] rounded bg-muted animate-pulse" />
        <div className="h-3 w-[85%] rounded bg-muted animate-pulse" />
        <div className="pt-2 h-3 w-1/3 rounded bg-muted animate-pulse" />
      </div>
      <div className="border-t border-border p-3 flex gap-2">
        <div className="h-8 flex-1 rounded-md bg-muted animate-pulse" />
        <div className="h-8 flex-1 rounded-md bg-muted animate-pulse" />
      </div>
    </Card>
  );
}

export function PromptGrid({ loading, error, cards, engine, onRetry }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 sm:p-8 border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              생성 중 오류가 발생했습니다
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{error}</p>
            <Button onClick={onRetry} className="mt-4" size="sm">
              <RotateCw className="h-3.5 w-3.5" strokeWidth={2.25} />
              다시 시도
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, i) => (
        <PromptCard key={card.id} card={card} index={i} engine={engine} />
      ))}
    </div>
  );
}
