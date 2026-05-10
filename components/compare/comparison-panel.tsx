"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Columns3,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type CompareEntry,
  useCompare,
} from "./compare-context";
import {
  ELEMENT_LABEL,
  ELEMENT_ORDER,
  ENGINE_LABEL,
  ENGINE_LABEL_SHORT,
  type ElementKey,
} from "@/lib/types";

const PANEL_PEEK_HEIGHT = 64; // px when collapsed

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

function buildComparisonMarkdown(entries: CompareEntry[]): string {
  if (entries.length === 0) return "";
  const conceptKo = entries[0].conceptKo;
  const engine = entries[0].engine;

  const headerCols = entries
    .map((e) => `${String(e.index).padStart(2, "0")}. ${e.card.styleLabel}`)
    .join(" | ");
  const sep = entries.map(() => "---").join(" | ");

  const rowFor = (key: ElementKey) =>
    `| ${ELEMENT_LABEL[key]} | ${entries
      .map((e) => (e.card.elements?.[key] ?? "—").replace(/\|/g, "\\|"))
      .join(" | ")} |`;

  const intentRow = `| 의도 | ${entries
    .map((e) => (e.card.intentKo ?? "—").replace(/\|/g, "\\|"))
    .join(" | ")} |`;

  const tail =
    engine === "midjourney"
      ? `| 파라미터 | ${entries
          .map((e) => (e.card.parameters ?? "—").replace(/\|/g, "\\|"))
          .join(" | ")} |`
      : `| Negative | ${entries
          .map((e) =>
            (e.card.negative ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " ")
          )
          .join(" | ")} |`;

  const tableLines = [
    `| 항목 | ${headerCols} |`,
    `| --- | ${sep} |`,
    intentRow,
    ...ELEMENT_ORDER.map(rowFor),
    tail,
  ];

  const promptBlocks = entries
    .map(
      (e) =>
        `### ${String(e.index).padStart(2, "0")}. ${e.card.styleLabel} (${e.card.styleLabelKo})\n${e.card.promptFull}`
    )
    .join("\n\n");

  return [
    `# 프롬프트 비교 (${entries.length}장) — ${ENGINE_LABEL[engine]}`,
    `> 컨셉: ${conceptKo}`,
    "",
    ...tableLines,
    "",
    "## 영문 프롬프트",
    "",
    promptBlocks,
  ].join("\n");
}

export function ComparisonPanel() {
  const { entries, count, clear, remove } = useCompare();
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-expand when a new card is added; auto-collapse if count drops below 2
  useEffect(() => {
    if (count >= 2) setExpanded(true);
  }, [count]);

  // Pad page bottom so content isn't hidden behind the fixed panel
  useEffect(() => {
    if (count < 2) {
      document.body.style.paddingBottom = "";
      return;
    }
    document.body.style.paddingBottom = expanded
      ? "min(70vh, 560px)"
      : `${PANEL_PEEK_HEIGHT + 16}px`;
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [count, expanded]);

  const visible = count >= 2;

  if (count === 0) return null;

  // Single-card hint (not enough to compare yet)
  if (count === 1 && !visible) return null;

  async function handleCopy() {
    const text = buildComparisonMarkdown(entries);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success(`비교 표 ${count}장을 일괄 복사했습니다.`);
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error("복사에 실패했습니다.");
    }
  }

  return (
    <aside
      role="region"
      aria-label="프롬프트 비교 패널"
      className={cn(
        "fixed left-0 right-0 bottom-0 z-50 border-t border-border bg-background shadow-soft",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      style={{
        maxHeight: expanded ? "min(70vh, 560px)" : `${PANEL_PEEK_HEIGHT}px`,
      }}
    >
      {/* Header bar */}
      <div className="container max-w-6xl flex items-center justify-between gap-2 px-4 sm:px-5 h-16">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2.5 text-left flex-1 min-w-0 group"
          aria-expanded={expanded}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Columns3 className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              프롬프트 비교 ·{" "}
              <span className="text-muted-foreground font-normal">
                {count}장 선택됨 (최대 3장)
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {entries
                .map(
                  (e) =>
                    `${String(e.index).padStart(2, "0")} ${e.card.styleLabel}`
                )
                .join(" · ")}
            </p>
          </div>
          <span className="ml-1 text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
            {expanded ? (
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ChevronUp className="h-4 w-4" strokeWidth={2} />
            )}
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="outline" onClick={clear}>
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">전체 해제</span>
          </Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            일괄 복사
          </Button>
        </div>
      </div>

      {/* Body — comparison table */}
      {expanded && (
        <div
          className="container max-w-6xl px-4 sm:px-5 pb-5 overflow-auto scrollbar-thin"
          style={{ maxHeight: "calc(min(70vh, 560px) - 64px)" }}
        >
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-[12.5px] border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[88px] sticky left-0 bg-muted/50 z-10 border-r border-border">
                      항목
                    </th>
                    {entries.map((e) => (
                      <th
                        key={e.card.id}
                        className="text-left font-medium px-3 py-2.5 align-top min-w-[200px] border-r border-border last:border-r-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge
                                variant="outline"
                                className="border-foreground/15 text-[10px] py-0"
                              >
                                {String(e.index).padStart(2, "0")}
                              </Badge>
                              <Badge
                                variant="muted"
                                className="text-[10px] py-0"
                              >
                                {ENGINE_LABEL_SHORT[e.engine]}
                              </Badge>
                            </div>
                            <p className="text-foreground font-semibold truncate">
                              {e.card.styleLabel}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {e.card.styleLabelKo}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(e.card.id)}
                            aria-label="이 카드 비교에서 제외"
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 의도 row */}
                  <tr className="border-t border-border">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 align-top sticky left-0 bg-background z-10 border-r border-border">
                      의도
                    </th>
                    {entries.map((e) => (
                      <td
                        key={e.card.id}
                        className="px-3 py-2.5 align-top text-foreground/85 leading-relaxed border-r border-border last:border-r-0"
                      >
                        {e.card.intentKo || (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 4-element rows */}
                  {ELEMENT_ORDER.map((key) => (
                    <tr key={key} className="border-t border-border">
                      <th className="text-left font-medium text-foreground px-3 py-2.5 align-top sticky left-0 bg-background z-10 border-r border-border">
                        {ELEMENT_LABEL[key]}
                      </th>
                      {entries.map((e) => {
                        const v = e.card.elements?.[key];
                        return (
                          <td
                            key={e.card.id}
                            className="px-3 py-2.5 align-top border-r border-border last:border-r-0"
                          >
                            {v ? (
                              <span className="text-foreground/90 leading-relaxed">
                                {v}
                              </span>
                            ) : (
                              <span
                                className="text-muted-foreground/60"
                                title="이 카드에는 4요소 메타데이터가 없습니다 (이전 형식). 다시 생성하면 채워집니다."
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* parameters / negative */}
                  <tr className="border-t border-border">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 align-top sticky left-0 bg-background z-10 border-r border-border">
                      {entries[0].engine === "midjourney"
                        ? "파라미터"
                        : "Negative"}
                    </th>
                    {entries.map((e) => {
                      const v =
                        e.engine === "midjourney" ? e.card.parameters : e.card.negative;
                      return (
                        <td
                          key={e.card.id}
                          className="px-3 py-2.5 align-top border-r border-border last:border-r-0"
                        >
                          <span className="font-mono text-[11.5px] text-foreground/85 leading-relaxed break-words">
                            {v ?? (
                              <span className="text-muted-foreground/60">
                                —
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* promptOnly */}
                  <tr className="border-t border-border">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 align-top sticky left-0 bg-background z-10 border-r border-border">
                      영문 본문
                    </th>
                    {entries.map((e) => (
                      <td
                        key={e.card.id}
                        className="px-3 py-2.5 align-top border-r border-border last:border-r-0"
                      >
                        <p className="font-mono text-[11.5px] text-foreground/80 leading-[1.65] whitespace-pre-wrap break-words">
                          {e.card.promptOnly}
                        </p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            카드 우측 상단{" "}
            <Columns3
              className="inline h-3 w-3 -mt-0.5 mx-0.5"
              strokeWidth={2}
            />{" "}
            아이콘으로 비교 카드를 추가/제거할 수 있습니다 · 4번째 카드를 추가하면 가장 먼저 선택한 카드가 자동 해제됩니다.
          </p>
        </div>
      )}
    </aside>
  );
}

/**
 * Hint shown above the panel when only 1 card is selected — encourages adding more.
 * Optional; render where you want it (e.g. under PromptGrid).
 */
export function ComparisonHint() {
  const { count } = useCompare();
  if (count !== 1) return null;
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-2.5 flex items-center gap-2.5">
      <Columns3 className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
      <p className="text-xs text-muted-foreground">
        비교 카드 1장을 선택했습니다 · 1장 더 선택하면 하단에 4요소 비교 패널이
        나타납니다.
      </p>
    </div>
  );
}
