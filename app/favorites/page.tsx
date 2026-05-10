"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Eye,
  Search,
  Trash,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PromptCard } from "@/components/prompt/prompt-card";
import {
  clearFavorites,
  removeFavoriteById,
  removeFavoritesByIds,
} from "@/lib/favorites-storage";
import { useFavorites } from "@/components/favorites/favorites-context";
import type { Engine, FavoriteEntry } from "@/lib/types";
import { ENGINE_LABEL, ENGINE_LABEL_SHORT } from "@/lib/types";
import { cn } from "@/lib/utils";

type EngineFilter = "all" | Engine;

const FILTER_OPTIONS: { value: EngineFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "midjourney", label: "Midjourney" },
  { value: "stable-diffusion", label: "Stable Diffusion" },
];

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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

function buildBulkText(entries: FavoriteEntry[]): string {
  const blocks = entries.map((e, i) => {
    const header = `# ${String(i + 1).padStart(2, "0")} · ${e.card.styleLabel} (${ENGINE_LABEL[e.engine]})\n# 컨셉: ${e.conceptKo}`;
    return `${header}\n${e.card.promptFull}`;
  });
  return blocks.join("\n\n---\n\n");
}

export default function FavoritesPage() {
  const { favorites, setFavorites } = useFavorites();
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EngineFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedBulk, setCopiedBulk] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return favorites.filter((entry) => {
      if (filter !== "all" && entry.engine !== filter) return false;
      if (!q) return true;
      const haystack = [
        entry.conceptKo,
        entry.card.styleLabel,
        entry.card.styleLabelKo,
        entry.card.intentKo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [favorites, query, filter]);

  const opened = useMemo(
    () => favorites.find((e) => e.id === openId) ?? null,
    [favorites, openId]
  );

  const counts = useMemo(() => {
    const mj = favorites.filter((e) => e.engine === "midjourney").length;
    const sd = favorites.filter((e) => e.engine === "stable-diffusion").length;
    return { all: favorites.length, mj, sd };
  }, [favorites]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((e) => selected.has(e.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const e of filtered) next.delete(e.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const e of filtered) next.add(e.id);
        return next;
      });
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleBulkCopy() {
    const entries = favorites.filter((e) => selected.has(e.id));
    if (entries.length === 0) {
      toast.error("복사할 카드를 선택해 주세요.");
      return;
    }
    const ok = await copyToClipboard(buildBulkText(entries));
    if (ok) {
      setCopiedBulk(true);
      toast.success(`${entries.length}개 카드를 일괄 복사했습니다.`);
      setTimeout(() => setCopiedBulk(false), 1800);
    } else {
      toast.error("복사에 실패했습니다.");
    }
  }

  function handleBulkDelete() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    const next = removeFavoritesByIds(ids);
    setFavorites(next);
    clearSelection();
    toast.success(`${ids.length}개 항목을 삭제했습니다.`);
  }

  function handleDeleteOne(id: string) {
    const next = removeFavoriteById(id);
    setFavorites(next);
    setSelected((prev) => {
      const ns = new Set(prev);
      ns.delete(id);
      return ns;
    });
    if (openId === id) setOpenId(null);
    toast.success("즐겨찾기에서 제거했습니다.");
  }

  function handleClearAll() {
    clearFavorites();
    setFavorites([]);
    clearSelection();
    setConfirmClear(false);
    toast.success("즐겨찾기를 모두 비웠습니다.");
  }

  return (
    <div className="container max-w-6xl py-10 sm:py-14">
      {/* Title */}
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              메인으로
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Bookmark className="h-6 w-6" strokeWidth={2} />
            즐겨찾기
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            북마크한 카드 단위로 저장됩니다 · 최대 200건, 이 브라우저에만 보관
          </p>
        </div>
        {favorites.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClear(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/5 shrink-0"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            전체 비우기
          </Button>
        )}
      </div>

      {!loaded ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-3 w-1/3 rounded bg-muted animate-pulse mb-3" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse mb-2" />
              <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            </Card>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Bookmark className="h-5 w-5" strokeWidth={2} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            아직 즐겨찾기한 카드가 없습니다
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            메인 페이지에서 5장 카드 우측 상단 북마크 아이콘을 눌러 저장해 보세요.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">
              <Wand2 className="h-4 w-4" strokeWidth={2} />
              프롬프트 생성하러 가기
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Toolbar */}
          <div className="space-y-3 mb-5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="컨셉 키워드, 스타일명으로 검색"
                  className="pl-9 pr-9"
                  type="search"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="검색어 지우기"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>

              <div
                role="radiogroup"
                aria-label="엔진 필터"
                className="inline-flex rounded-lg border border-border bg-muted/40 p-1 self-stretch"
              >
                {FILTER_OPTIONS.map((opt) => {
                  const active = filter === opt.value;
                  const c =
                    opt.value === "all"
                      ? counts.all
                      : opt.value === "midjourney"
                        ? counts.mj
                        : counts.sd;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFilter(opt.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        active
                          ? "bg-background text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                      <span className="ml-1.5 text-[10.5px] opacity-70">
                        {c}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAllFiltered}
                  disabled={filtered.length === 0}
                >
                  {allFilteredSelected ? "선택 해제" : "전체 선택"}
                </Button>
                {selected.size > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {selected.size}개 선택됨
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={selected.size === 0}
                  className={cn(
                    selected.size > 0 &&
                      "text-destructive hover:text-destructive hover:bg-destructive/5"
                  )}
                >
                  <Trash className="h-3.5 w-3.5" strokeWidth={2} />
                  선택 삭제
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleBulkCopy}
                  disabled={selected.size === 0}
                >
                  {copiedBulk ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  일괄 복사
                </Button>
              </div>
            </div>
          </div>

          {/* Result list */}
          {filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Search className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-3 text-sm text-foreground font-medium">
                조건에 맞는 즐겨찾기가 없습니다
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                검색어나 엔진 필터를 바꿔보세요.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((entry) => {
                const isSel = selected.has(entry.id);
                return (
                  <Card
                    key={entry.id}
                    className={cn(
                      "p-5 transition-colors flex flex-col",
                      isSel
                        ? "border-foreground/40 ring-1 ring-foreground/10"
                        : "hover:border-foreground/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline">
                          {ENGINE_LABEL_SHORT[entry.engine]}
                        </Badge>
                        <Badge variant="muted" className="text-[10.5px]">
                          {entry.card.styleLabel}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatRelative(entry.savedAt)}
                      </span>
                    </div>

                    <p className="text-[13.5px] text-muted-foreground mb-1">
                      {entry.card.styleLabelKo}
                    </p>
                    <p className="text-[14px] font-medium text-foreground leading-relaxed line-clamp-2 mb-2.5">
                      {entry.conceptKo}
                    </p>
                    <p className="font-mono text-[11.5px] text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                      {entry.card.promptOnly}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <label
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium cursor-pointer select-none transition-colors",
                          isSel
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleSelect(entry.id)}
                          className="sr-only"
                        />
                        {isSel ? (
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        ) : (
                          <span className="h-3 w-3 rounded-sm border border-foreground/30" />
                        )}
                        선택
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenId(entry.id)}
                        className="h-8 px-3 text-[11.5px]"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                        열기
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteOne(entry.id)}
                        className="ml-auto h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5"
                        aria-label="삭제"
                      >
                        <Trash className="h-3.5 w-3.5" strokeWidth={2} />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Detail dialog — reuses PromptCard */}
      <Dialog open={!!opened} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto scrollbar-thin">
          {opened && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-1.5 self-start">
                  <Badge variant="outline">{ENGINE_LABEL[opened.engine]}</Badge>
                  <Badge variant="muted">{opened.card.styleLabel}</Badge>
                </div>
                <DialogTitle className="text-xl text-balance">
                  {opened.conceptKo}
                </DialogTitle>
                <DialogDescription>
                  {formatRelative(opened.savedAt)}에 저장 · {opened.card.styleLabelKo}
                </DialogDescription>
              </DialogHeader>

              <PromptCard
                card={opened.card}
                index={0}
                engine={opened.engine}
                conceptKo={opened.conceptKo}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear-all confirm */}
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>즐겨찾기를 모두 비울까요?</DialogTitle>
            <DialogDescription>
              저장된 모든 카드가 영구적으로 삭제됩니다. 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              모두 비우기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
