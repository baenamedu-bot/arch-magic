"use client";

import { cn } from "@/lib/utils";
import type { Engine } from "@/lib/types";

interface Props {
  value: Engine;
  onChange: (e: Engine) => void;
  disabled?: boolean;
}

const OPTIONS: { value: Engine; label: string; sub: string }[] = [
  { value: "midjourney", label: "Midjourney", sub: "V8.1 · CLI 파라미터" },
  { value: "stable-diffusion", label: "Stable Diffusion", sub: "키워드 + Negative" },
];

export function EngineToggle({ value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="타깃 이미지 엔진"
      className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-1"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-md px-3.5 py-2.5 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-background shadow-sm border border-border"
                : "hover:bg-background/60 border border-transparent",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {opt.label}
            </span>
            <span className="text-[11px] text-muted-foreground">{opt.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
