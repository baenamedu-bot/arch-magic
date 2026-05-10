# Arch-Magic — Build Decisions

> 한글 건축 컨셉 → 미드저니/스테이블 디퓨전용 영문 프롬프트 5종 변환기.
> 본 문서는 1차 출시 빌드의 결정 사항 기록.

## 1. 핵심 의사결정

### 스택
- Next.js 14.2.x (App Router) + TypeScript + Tailwind CSS
- 상태/저장: localStorage (서버 DB 없음)
- AI 호출: `@google/generative-ai` 클라이언트 측 직접 호출 (BYOK)
- UI 프리미티브: Radix(`@radix-ui/react-dialog`, `react-switch`, `react-label`) + class-variance-authority
- 아이콘: `lucide-react`
- 토스트: `sonner`
- 폰트: Pretendard Variable (jsDelivr CDN, 다이나믹 서브셋)

### 컬러/디자인 토큰
- 베이스: `zinc` (light) / 다크모드 비제공 (1차 출시 단순화)
- accent: `slate-900` (딥네이비/차콜) — violet/purple 절대 금지
- 라운드: `rounded-xl` 카드, `rounded-lg` 입력
- 그림자: `shadow-sm` 한 단계만, 강조는 border 톤 변경
- 버튼 높이: 기본 `h-11`, CTA `h-12`
- 모션: `transition-all duration-200`, 카드 등장 stagger 페이드인 (60ms 간격)

### 폴더 구조
```
app/
  layout.tsx
  page.tsx                    (메인: 입력 + 5카드)
  history/page.tsx            (히스토리)
  globals.css
components/
  branding/
    brand-constants.ts
    footer-credit.tsx
    creator-info-modal.tsx
    welcome-modal.tsx
  settings/
    api-key-modal.tsx
  prompt/
    concept-form.tsx          (입력 폼 + 엔진 토글)
    prompt-card.tsx           (단일 카드)
    prompt-grid.tsx           (5장 카드 그리드 + 스켈레톤)
    disclaimer.tsx
  ui/                         (shadcn 스타일 커스텀)
    button.tsx, input.tsx, textarea.tsx, label.tsx,
    dialog.tsx, switch.tsx, badge.tsx, card.tsx
  app-header.tsx
lib/
  api-key-storage.ts
  gemini-client.ts            (시스템 프롬프트 + 호출 + 파싱)
  history-storage.ts
  types.ts
  utils.ts                    (cn helper)
```

### localStorage 스키마 (key 별 분리)
- `gemini_api_key` : string (raw API key)
- `arch_magic_history_v1` : `HistoryEntry[]` — 최근 30건, FIFO 트림
- `arch_magic_settings_v1` : `{ engine: 'midjourney' | 'stable-diffusion' }`
- `welcome_shown_v1` : '1' (1회 노출 플래그)

### 데이터 타입 (lib/types.ts)
```ts
type Engine = 'midjourney' | 'stable-diffusion';

interface PromptCard {
  id: string;
  styleLabel: string;       // ex) "Cinematic & Dramatic"
  styleLabelKo: string;     // ex) "시네마틱 · 드라마틱"
  intentKo: string;         // 한글 의도 1~2줄
  promptOnly: string;       // 영문 프롬프트 본문
  promptFull: string;       // 본문 + 엔진 파라미터/네거티브
  parameters?: string;      // ex) "--v 8.1 --ar 16:9 --stylize 250 --style raw"
  negative?: string;        // SD only
}

interface HistoryEntry {
  id: string;
  conceptKo: string;
  engine: Engine;
  cards: PromptCard[];
  createdAt: number;
}
```

### Gemini 모델 선택
- 모델: `gemini-2.5-flash` (빠르고 JSON 모드 지원, BYOK 환경에서 비용 적절)
- 응답 형식: `responseMimeType: 'application/json'` 강제
- temperature: 0.85 (스타일 다양성 확보)

### 시스템 프롬프트 (요지)
페르소나: "20년 경력 건축 디렉터(SAA·AIA·RIBA 자격)와 협업해온 시니어 AI 엔지니어. 국제 건축상 출품작 비주얼라이제이션 경험 200+. 미드저니 v8.1 / SD 양쪽 워크플로우에 능통."

규칙:
1. 사용자의 한글 컨셉을 받아 **반드시 5장의 카드**로 확장.
2. 5장은 서로 명확히 구분되는 무드/스타일이어야 함. 다음 라이브러리에서 골라 다양성 확보:
   `Cinematic & Dramatic`, `Minimalist Brutalism`, `Sustainable Biophilic`,
   `Nordic Noir`, `Avant-Garde Structure`, `Warm Vernacular`, `Hi-Tech Parametric`,
   `Soft Wabi-Sabi`, `Industrial Loft Adaptive Reuse`, `Light & Shadow Study`.
3. 각 프롬프트 본문에는 **재질 / 공간감 / 조명 / 카메라 렌즈** 4요소를 자연스럽게 포함.
4. 한글 의도 설명 1~2줄 — "왜 이 무드인지, 어떤 클라이언트 인상을 노리는지".
5. 엔진별 차이:
   - Midjourney: 본문 끝에 `--v 8.1 --ar 16:9 --stylize 200~400 --style raw` 식 파라미터 부착, 카메라 키워드는 자연어 (Hasselblad, 35mm 등). negative 없음.
   - Stable Diffusion: 본문은 키워드 콤마 결합 (`Photorealistic, 8k, octane render, ultra-detailed, Hasselblad medium format` 등), 별도 `negative` 필드 (`blurry, low quality, distorted geometry, oversaturated, cartoon`).
6. 출력은 반드시 다음 JSON 스키마:
```json
{ "cards": [{ "styleLabel": "...", "styleLabelKo": "...", "intentKo": "...",
  "promptOnly": "...", "parameters": "...", "negative": "..." }] }
```
7. 한국어 단어/장소·재료(노출 콘크리트, 강화도, 제주 현무암 등) → 정확한 영문 건축 용어로 (`exposed concrete (béton brut)`, `Ganghwado coastal`, `Jeju basalt stone wall (dol-dam)` 등).

### 렌더링 방식
- 메인 페이지는 `'use client'` (입력/생성/엔진 토글 모두 클라이언트 상태)
- 결과 5장 등장 시 stagger 페이드인 (Tailwind keyframes 또는 CSS animation-delay)
- 로딩 중: 5장 카드 스켈레톤
- 에러: Gemini 에러 코드(403, 429, 500 등) 별 친절한 한글 메시지 + 재시도 버튼
- 성공 시: history 자동 저장(최대 30) + 토스트 "히스토리에 저장되었습니다"

### 브랜딩 적용
- `<FooterCredit />` 모든 페이지 하단
- 헤더: 좌측 로고/이름 (Sparkles 아이콘 + Arch-Magic), 우측 ⓘ(소개) · 🕘 히스토리 링크 · ⚙️(API키)
- 첫 방문: `WelcomeModal` 자동 1회

### 면책 고지
결과 그리드 아래에 항상 노출:
"본 이미지는 디자인 영감용이며, 실제 시공·인허가를 위해서는 별도의 설계 검토(건폐율·용적률 등)가 필요합니다."

## 2. 작업 순서
- [x] Next.js 14 init + deps
- [ ] CLAUDE.md (이 파일)
- [ ] 디자인 시스템 / 글로벌 스타일
- [ ] 브랜딩 컴포넌트 4종
- [ ] API 키 시스템 (storage + client + modal)
- [ ] Layout + Header + Footer
- [ ] 메인 페이지 (입력 + 5카드)
- [ ] 히스토리 페이지
- [ ] 빌드 검증
- [ ] GitHub push
- [ ] Vercel 배포
