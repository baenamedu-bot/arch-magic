import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

import { ApiKeyProvider } from "@/components/settings/api-key-context";
import { AppHeader } from "@/components/app-header";
import { FooterCredit } from "@/components/branding/footer-credit";
import { WelcomeModal } from "@/components/branding/welcome-modal";

export const metadata: Metadata = {
  title: "Arch-Magic — 한글 건축 컨셉을 미드저니·SD 프롬프트 5종으로",
  description:
    "건축가·인테리어 디자이너를 위한 AI 프롬프트 변환 도구. 한글 컨셉을 입력하면 미드저니 V8.1 또는 Stable Diffusion 용 영문 프롬프트 5종을 동시에 생성합니다. 유앤미스튜디오 제작.",
  keywords: [
    "건축",
    "AI",
    "프롬프트",
    "미드저니",
    "Midjourney",
    "Stable Diffusion",
    "Arch-Magic",
    "유앤미스튜디오",
    "younme.ai.kr",
  ],
  authors: [{ name: "최인영", url: "https://younme.ai.kr" }],
  creator: "유앤미스튜디오",
  openGraph: {
    title: "Arch-Magic — 건축 컨셉 → AI 프롬프트 변환기",
    description:
      "한글 건축 컨셉을 미드저니·Stable Diffusion 프롬프트 5종으로 즉시 변환. 유앤미스튜디오의 AI 교육 프로그램에서 제작되었습니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Arch-Magic",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <ApiKeyProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <FooterCredit />
          <WelcomeModal />
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily:
                  "Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
              },
            }}
          />
        </ApiKeyProvider>
      </body>
    </html>
  );
}
