"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ExternalLink, KeyRound, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearApiKey,
  getApiKey,
  setApiKey as saveApiKey,
} from "@/lib/api-key-storage";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function ApiKeyModal({ open, onOpenChange, onSaved }: Props) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (open) {
      const existing = getApiKey() ?? "";
      setValue(existing);
      setHasExisting(!!existing);
      setShow(false);
    }
  }, [open]);

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 10) {
      toast.error("유효한 Gemini API 키를 입력해 주세요.");
      return;
    }
    saveApiKey(trimmed);
    toast.success("API 키가 저장되었습니다.");
    onSaved?.();
    onOpenChange(false);
  }

  function handleClear() {
    clearApiKey();
    setValue("");
    setHasExisting(false);
    toast.success("저장된 API 키를 삭제했습니다.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
            <KeyRound className="h-4 w-4" strokeWidth={2} />
          </div>
          <DialogTitle>Gemini API 키 설정</DialogTitle>
          <DialogDescription>
            Arch-Magic은 BYOK(Bring Your Own Key) 방식입니다. 키는 이 브라우저
            localStorage 에만 저장되며, 별도 서버로 전송되지 않습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3">
          <Label htmlFor="api-key">API 키</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              className="pr-10 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={show ? "키 숨기기" : "키 표시"}
            >
              {show ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            Gemini API 키 발급받기
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </a>

          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            입력한 키는 이 브라우저에만 저장되며 서버로 전송되지 않습니다.
            기기를 변경하면 다시 입력해야 합니다.
          </p>
        </form>

        <DialogFooter>
          {hasExisting && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="sm:mr-auto text-destructive hover:text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              저장된 키 삭제
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="submit" onClick={handleSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
