"use client";

import { ExternalLink, GraduationCap, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "./brand-constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatorInfoModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Badge variant="muted" className="self-start">
            <GraduationCap className="h-3 w-3" strokeWidth={2} />
            AI 교육 프로그램 제작
          </Badge>
          <DialogTitle className="text-xl">{BRAND.studio}</DialogTitle>
          <DialogDescription>
            이 앱은 {BRAND.studio}의 AI 교육 프로그램에서 제작되었습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground mb-1">제작</p>
            <p className="text-base font-semibold text-foreground">
              {BRAND.creator}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {BRAND.creatorTitle}
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            <Mail className="inline h-3.5 w-3.5 mr-1 -mt-0.5" strokeWidth={2} />
            AI 교육 · 강연 · 맞춤 앱 제작 문의 환영합니다.
          </p>
        </div>

        <Button asChild size="lg" className="w-full">
          <a href={BRAND.website} target="_blank" rel="noopener noreferrer">
            홈페이지 방문 → {BRAND.websiteLabel}
            <ExternalLink className="h-4 w-4" strokeWidth={2} />
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
