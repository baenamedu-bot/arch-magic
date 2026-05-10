# Arch-Magic

> 한글 건축 컨셉 → 미드저니 V8.1 / Stable Diffusion 영문 프롬프트 5종 변환기.
> 건축가 · 인테리어 디자이너의 컨셉 단계 시각화 시간을 단축하기 위한 디자인 리서치 자동화 도구.

## 주요 기능

- 한글 컨셉 한 줄 입력 → 영문 프롬프트 카드 5장 동시 생성
- 5장은 모두 다른 무드 (Cinematic, Minimalist Brutalism, Biophilic, Nordic Noir, Avant-Garde Structure 등)
- 모든 카드에 **재질 · 공간감 · 조명 · 카메라** 4요소 자연스럽게 포함
- 카드별 한글 의도 1~2줄 (왜 이 무드인지)
- 타깃 엔진 토글: **Midjourney V8.1** (CLI 파라미터) / **Stable Diffusion** (키워드 + Negative)
- 카드별 복사 버튼 (영문만 / 전체)
- 최근 30건 자동 히스토리 (localStorage)
- BYOK — 사용자 본인의 Gemini API 키, 브라우저 외부로 절대 전송되지 않음

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + 커스텀 디자인 시스템 (slate-900 accent)
- Pretendard Variable (한글)
- `@google/generative-ai` (Gemini 2.5 Flash, JSON 응답)
- shadcn/ui 스타일 (Radix UI 기반)
- lucide-react · sonner

## 시작하기

```bash
npm install
npm run dev
```

앱이 열리면 우측 상단 ⚙️ 버튼을 눌러 Gemini API 키를 입력하세요.
키는 [Google AI Studio](https://aistudio.google.com/app/apikey) 에서 무료로 발급받을 수 있습니다.

## API 키 정책

- 키는 **사용자 브라우저 localStorage** (`gemini_api_key`) 에만 저장됩니다.
- 서버로 전송되지 않으며, 본 프로젝트는 키 중계용 API Route 를 두지 않습니다.
- `.env.local`, Vercel 환경변수에 키를 넣지 마세요.

## 면책 고지

본 프롬프트로 생성된 이미지는 디자인 영감용이며,
실제 시공·인허가를 위해서는 별도의 설계 검토(건폐율·용적률 등)가 필요합니다.

## 제작

본 앱은 **유앤미스튜디오**의 AI 교육 프로그램에서 제작되었습니다.

- 제작: **최인영** (유앤미스튜디오 대표 · 건축사 · AI 교육 강사)
- 홈페이지: [younme.ai.kr](https://younme.ai.kr)
- AI 교육 · 강연 · 맞춤 앱 제작 문의 환영합니다.
