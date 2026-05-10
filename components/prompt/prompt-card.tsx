"use client";

import { useState } from "react";
import { Bookmark, Check, Copy, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Engine, PromptCard as PromptCardType } from "@/lib/types";
import { toast } from "sonner";
import { useFavorites } from "@/components/favorites/favorites-context";

interface Props {
  card: PromptCardType;
  index: number;
  engine: Engine;
  /** Required so the card can be saved with its source concept (for /favorites). */
  conceptKo: string;
  /** When true, hides the copy/bookmark footer (compact view). Default false. */
  compact?: boolean;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function PromptCard({ card, index, engine, conceptKo, compact }: Props) {
  const [copied, setCopied] = useState<"only" | "full" | null>(null);
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(card.id);

  async function handleCopy(which: "only" | "full") {
    const text = which === "only" ? card.promptOnly : card.promptFull;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(which);
      toast.success(which === "only" ? "영문 프롬프트만 복사" : "전체 프롬프트 복사");
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 1600);
    } else {
      toast.error("복사에 실패했습니다.");
    }
  }

  function handleToggleFavorite() {
    toggleFavorite({ card, conceptKo, engine });
  }

  const delayClass = ["delay-card-0", "delay-card-1", "delay-card-2", "delay-card-3", "delay-card-4"][
    Math.min(index, 4)
  ];

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden hover:border-foreground/20 transition-colors",
        "animate-fade-in-up",
        delayClass
      )}
    >
      <div className="border-b border-border bg-muted/40 px-5 py-3.5 relative">
        <div className="flex items-start gap-2 mb-1.5 pr-9">
          <Badge variant="outline" className="border-foreground/15">
            <Layers className="h-3 w-3" strokeWidth={2} />
            {String(index + 1).padStart(2, "0")}
          </Badge>
          <span className="text-xs font-semibold text-foreground tracking-tight pt-0.5">
            {card.styleLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pr-9">
          <span className="font-medium text-foreground">{card.styleLabelKo}</span>
          {card.intentKo && <span className="block mt-1">{card.intentKo}</span>}
        </p>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={favorited}
          aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기에 저장"}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            favorited
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
          )}
        >
          <Bookmark
            className={cn("h-4 w-4", favorited && "fill-current")}
            strokeWidth={favorited ? 2.25 : 2}
          />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
            영문 프롬프트
          </p>
          <p className="font-mono text-[12.5px] leading-[1.65] text-foreground/90 whitespace-pre-wrap break-words">
            {card.promptOnly}
          </p>
        </div>

        {engine === "midjourney" && card.parameters && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              파라미터
            </p>
            <p className="font-mono text-[12px] text-foreground/80 break-words">
              {card.parameters}
            </p>
          </div>
        )}

        {engine === "stable-diffusion" && card.negative && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Negative prompt
            </p>
            <p className="font-mono text-[12px] text-muted-foreground break-words leading-relaxed">
              {card.negative}
            </p>
          </div>
        )}
      </div>

      {!compact && (
        <div className="border-t border-border p-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy("only")}
            className="flex-1"
          >
            {copied === "only" ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            영문만
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleCopy("full")}
            className="flex-1"
          >
            {copied === "full" ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            전체 복사
          </Button>
        </div>
      )}
    </Card>
  );
}
