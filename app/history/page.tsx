"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Eye,
  Trash,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PromptCard } from "@/components/prompt/prompt-card";
import {
  clearHistory,
  deleteHistory,
  getHistory,
} from "@/lib/history-storage";
import type { HistoryEntry } from "@/lib/types";
import { ENGINE_LABEL } from "@/lib/types";

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

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setItems(getHistory());
    setLoaded(true);
  }, []);

  const opened = useMemo(
    () => items.find((i) => i.id === openId) ?? null,
    [items, openId]
  );

  function handleDelete(id: string) {
    const next = deleteHistory(id);
    setItems(next);
    if (openId === id) setOpenId(null);
    toast.success("히스토리 항목을 삭제했습니다.");
  }

  function handleClearAll() {
    clearHistory();
    setItems([]);
    setConfirmClear(false);
    toast.success("히스토리를 모두 비웠습니다.");
  }

  return (
    <div className="container max-w-6xl py-10 sm:py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              메인으로
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            히스토리
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            최근 30건까지 자동 저장됩니다. 데이터는 이 브라우저에만 보관됩니다.
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClear(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/5"
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
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Clock className="h-5 w-5" strokeWidth={2} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            아직 생성한 프롬프트가 없습니다
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            메인 페이지에서 첫 번째 컨셉을 입력해 보세요.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">
              <Wand2 className="h-4 w-4" strokeWidth={2} />
              프롬프트 생성하러 가기
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((entry) => (
            <Card
              key={entry.id}
              className="p-5 hover:border-foreground/20 transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between mb-2.5">
                <Badge variant="outline">
                  {ENGINE_LABEL[entry.engine]}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelative(entry.createdAt)}
                </span>
              </div>
              <p className="text-[14.5px] font-medium text-foreground leading-relaxed line-clamp-3 flex-1">
                {entry.conceptKo}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {entry.cards.length}개 카드
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpenId(entry.id)}
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                  열어보기
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/5"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="삭제"
                >
                  <Trash className="h-3.5 w-3.5" strokeWidth={2} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!opened} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto scrollbar-thin">
          {opened && (
            <>
              <DialogHeader>
                <Badge variant="outline" className="self-start">
                  {ENGINE_LABEL[opened.engine]}
                </Badge>
                <DialogTitle className="text-xl text-balance">
                  {opened.conceptKo}
                </DialogTitle>
                <DialogDescription>
                  {formatRelative(opened.createdAt)} · {opened.cards.length}개 카드
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {opened.cards.map((card, i) => (
                  <PromptCard
                    key={card.id}
                    card={card}
                    index={i}
                    engine={opened.engine}
                  />
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear-all confirm */}
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>히스토리를 모두 비울까요?</DialogTitle>
            <DialogDescription>
              저장된 모든 항목이 영구적으로 삭제됩니다. 되돌릴 수 없습니다.
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
