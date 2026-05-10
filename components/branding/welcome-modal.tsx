"use client";

import { useEffect, useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isWelcomeShown, markWelcomeShown } from "@/lib/history-storage";
import { BRAND } from "./brand-constants";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isWelcomeShown()) {
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  function handleClose(next: boolean) {
    if (!next) markWelcomeShown();
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </div>
          <DialogTitle className="text-2xl">
            {BRAND.appName}에 오신 것을 환영합니다
          </DialogTitle>
          <DialogDescription className="text-pretty">
            한글로 떠올린 건축 컨셉을, 미드저니·Stable Diffusion에서 바로
            쓸 수 있는 영문 프롬프트 5종으로 한 번에 변환해 드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="text-foreground leading-relaxed">
            <span className="font-medium">{BRAND.studio}</span>의 AI 교육에서
            만든 앱입니다. 컨셉 단계 시각화 시간을 줄이고, 클라이언트 미팅과
            공모 제안을 더 빠르게 돌리세요.
          </p>
          <a
            href={BRAND.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {BRAND.websiteLabel}
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </a>
        </div>

        <Button size="lg" onClick={() => handleClose(false)}>
          시작하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
