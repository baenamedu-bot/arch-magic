"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Compass, History, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiKeyModal } from "@/components/settings/api-key-context";
import { useFavorites } from "@/components/favorites/favorites-context";
import { CreatorInfoModal } from "@/components/branding/creator-info-modal";
import { BRAND } from "@/components/branding/brand-constants";

export function AppHeader() {
  const { openApiKeyModal } = useApiKeyModal();
  const { count: favCount } = useFavorites();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container max-w-6xl flex h-14 items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className="text-[15px]">{BRAND.appName}</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/favorites">
                <Bookmark className="h-4 w-4" strokeWidth={2} />
                즐겨찾기
                {favCount > 0 && (
                  <span className="ml-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1">
                    {favCount > 99 ? "99+" : favCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="sm:hidden h-9 w-9 relative"
              aria-label="즐겨찾기"
            >
              <Link href="/favorites">
                <Bookmark className="h-4 w-4" strokeWidth={2} />
                {favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-semibold px-0.5">
                    {favCount > 99 ? "99+" : favCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/history">
                <History className="h-4 w-4" strokeWidth={2} />
                히스토리
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="sm:hidden h-9 w-9"
              aria-label="히스토리"
            >
              <Link href="/history">
                <History className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setInfoOpen(true)}
              aria-label="앱 소개"
            >
              <Info className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={openApiKeyModal}
              aria-label="API 키 설정"
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
            </Button>
          </nav>
        </div>
      </header>
      <CreatorInfoModal open={infoOpen} onOpenChange={setInfoOpen} />
    </>
  );
}
