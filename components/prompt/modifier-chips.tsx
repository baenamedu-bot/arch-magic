"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearGroup,
  countSelected,
  isModifierSelected,
  MODIFIER_GROUPS,
  toggleModifier,
  type ModifierSelection,
} from "@/lib/modifier-options";

interface Props {
  value: ModifierSelection;
  onChange: (next: ModifierSelection) => void;
  disabled?: boolean;
}

export function ModifierChips({ value, onChange, disabled }: Props) {
  const total = countSelected(value);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-medium text-foreground tracking-tight">
            빠른 옵션
          </p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            선택한 칩이 5장 카드 모두에 일관되게 반영됩니다 · 다중 선택 가능
          </p>
        </div>
        {total > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            disabled={disabled}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
          >
            전체 해제 ({total})
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {MODIFIER_GROUPS.map((group) => {
          const groupCount = (value[group.id] ?? []).length;
          return (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-medium text-foreground tracking-tight">
                    {group.label}
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {group.description}
                  </span>
                </div>
                {groupCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange(clearGroup(value, group.id))}
                    disabled={disabled}
                    className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={`${group.label} 선택 해제`}
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                    해제
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((opt) => {
                  const active = isModifierSelected(value, group.id, opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="switch"
                      aria-checked={active}
                      disabled={disabled}
                      onClick={() =>
                        onChange(toggleModifier(value, group.id, opt.id))
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        active
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-background border-border text-foreground hover:bg-muted hover:border-foreground/25",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {active && (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
