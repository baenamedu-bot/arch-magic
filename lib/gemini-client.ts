"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Engine, PromptCard } from "./types";
import {
  resolveModifiers,
  type ModifierSelection,
} from "./modifier-options";

const MODEL_ID = "gemini-2.5-flash";

const SYSTEM_PROMPT_BASE = `You are a senior AI engineer who has collaborated for 20+ years with award-winning architecture directors (SAA · AIA · RIBA), producing visualizations for 200+ international architecture-award submissions. You are fluent in both Midjourney v8.1 and Stable Diffusion XL workflows, and you can translate Korean architectural intent (재질·공간감·매스·입면 등) into precise English visualization briefs.

Your task: take the user's Korean architectural concept and produce EXACTLY 5 prompt cards that explore the concept through 5 distinctly different moods/styles.

HARD RULES:
1. Output 5 cards. No more, no less.
2. The 5 cards MUST be meaningfully different in mood — pick from this style library and ensure no two cards share the same mood:
   - Cinematic & Dramatic (시네마틱 · 드라마틱)
   - Minimalist Brutalism (미니멀 브루탈리즘)
   - Sustainable Biophilic (지속가능 · 바이오필릭)
   - Nordic Noir (노르딕 누아르)
   - Avant-Garde Structure (아방가르드 구조)
   - Warm Vernacular (따뜻한 토속/지역성)
   - Hi-Tech Parametric (하이테크 파라메트릭)
   - Soft Wabi-Sabi (소프트 와비사비)
   - Industrial Loft Adaptive Reuse (인더스트리얼 로프트)
   - Light & Shadow Study (빛과 그림자 연구)
3. Each promptOnly MUST naturally include all 4 of:
   - 재질 (materiality, e.g. exposed concrete / béton brut, brushed travertine, weathering steel, charred timber, brushed brass…)
   - 공간감 (spatial quality, e.g. double-height void, low-slung horizontality, compressive entry, cantilevered terrace…)
   - 조명 (lighting, e.g. golden hour raking light, overcast diffuse, theatrical chiaroscuro, soft north light…)
   - 카메라 (lens / camera, e.g. Hasselblad H6D, 24mm tilt-shift, 35mm prime, medium-format film…)
4. Translate Korean place names and materials into precise English architectural vocabulary. Examples:
   - 노출 콘크리트 → exposed concrete (béton brut)
   - 강화도 해변 → Ganghwado coastal landscape, West Sea tidal flats
   - 제주 돌담 → Jeju basalt stone wall (dol-dam), volcanic basalt masonry
   - 한옥 처마 → traditional hanok eaves with curved gable
5. intentKo: 1~2 short Korean sentences explaining WHY this mood was chosen and what client impression it targets. Use professional architecture vocabulary (매스, 입면, 파사드, 텍토닉, 보이드 등) — not generic words.
6. elements: short Korean one-liners (each ≤ 30 characters, NO trailing punctuation) summarising the four required elements as they appear in this card's promptOnly. These power the side-by-side comparison panel. Examples:
   - materiality: "황동 디테일 + 노출 콘크리트"
   - spatial: "6m 보이드 + 캔틸레버 발코니"
   - lighting: "저녁 황금시간 라킹 라이트"
   - camera: "35mm 프라임, 인물 시점"
   Use Korean architecture vocabulary, no English. Each must be a concise summary of what's in promptOnly, NOT a translation of the entire promptOnly.
7. Never include disallowed Midjourney content. Never describe real living people. Never include camera operator names.

OUTPUT: pure JSON only, no prose, no markdown fences. Strictly follow this schema:
{
  "cards": [
    {
      "styleLabel": "<English style name from the library>",
      "styleLabelKo": "<Korean style name from the library>",
      "intentKo": "<1-2 Korean sentences>",
      "elements": {
        "materiality": "<Korean one-liner ≤ 30 chars>",
        "spatial": "<Korean one-liner ≤ 30 chars>",
        "lighting": "<Korean one-liner ≤ 30 chars>",
        "camera": "<Korean one-liner ≤ 30 chars>"
      },
      "promptOnly": "<English prompt body — 4 elements naturally woven in>",
      "parameters": "<engine-specific parameters string OR empty>",
      "negative": "<SD-only negative prompt OR empty>"
    }
  ]
}`;

function engineDirective(engine: Engine): string {
  if (engine === "midjourney") {
    return `\nENGINE = Midjourney v8.1.
- promptOnly: a single flowing English description (1-3 sentences). No comma-keyword soup.
- parameters: a string ending with Midjourney CLI flags. Always include "--v 8.1". Pick aspect ratio appropriate to the subject (--ar 16:9 for exterior wide shots, --ar 3:2 for human-scale, --ar 4:5 for vertical interiors). Add "--style raw" when realism is wanted. Add "--stylize" between 100 and 500. Example: "--v 8.1 --ar 16:9 --stylize 250 --style raw".
- negative: leave as empty string "".`;
  }
  return `\nENGINE = Stable Diffusion (SDXL).
- promptOnly: comma-separated keyword/phrase string. Front-load the strongest descriptors. Include quality keywords like "Photorealistic, 8k, octane render, ultra-detailed, architectural photography, Hasselblad medium format". Include the 4 required elements (materiality / spatial / lighting / camera) as keyword phrases.
- parameters: leave as empty string "" (SD parameters live in the UI sampler, not in the prompt itself).
- negative: a comma-separated negative prompt. Always include common quality negatives ("blurry, low quality, low resolution, jpeg artifacts, oversaturated, cartoon, illustration, distorted geometry, warped perspective, extra windows, broken symmetry, watermark, text, logo, signature").`;
}

interface RawCardElements {
  materiality?: unknown;
  spatial?: unknown;
  lighting?: unknown;
  camera?: unknown;
}

interface RawCard {
  styleLabel?: unknown;
  styleLabelKo?: unknown;
  intentKo?: unknown;
  promptOnly?: unknown;
  parameters?: unknown;
  negative?: unknown;
  elements?: unknown;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asElements(v: unknown): import("./types").CardElements | undefined {
  if (!v || typeof v !== "object") return undefined;
  const r = v as RawCardElements;
  const result: import("./types").CardElements = {};
  const m = asString(r.materiality);
  const s = asString(r.spatial);
  const l = asString(r.lighting);
  const c = asString(r.camera);
  if (m) result.materiality = m;
  if (s) result.spatial = s;
  if (l) result.lighting = l;
  if (c) result.camera = c;
  return Object.keys(result).length > 0 ? result : undefined;
}

function buildFullPrompt(engine: Engine, c: { promptOnly: string; parameters: string; negative: string }): string {
  if (engine === "midjourney") {
    const tail = c.parameters ? ` ${c.parameters}` : "";
    return `${c.promptOnly}${tail}`.trim();
  }
  // Stable Diffusion: include negative as separate annotated line
  const negLine = c.negative ? `\nNegative prompt: ${c.negative}` : "";
  return `${c.promptOnly}${negLine}`.trim();
}

function safeJsonParse(text: string): unknown {
  // Strip ```json fences if present
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  // Find first { and last } to recover from minor leading/trailing tokens
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return JSON.parse(s);
}

export interface GenerateOptions {
  apiKey: string;
  conceptKo: string;
  engine: Engine;
  modifiers?: ModifierSelection;
  signal?: AbortSignal;
}

function buildModifierBlock(modifiers?: ModifierSelection): string {
  if (!modifiers) return "";
  const list = resolveModifiers(modifiers);
  if (list.length === 0) return "";

  // Group by groupLabel for cleaner prompt
  const byGroup: Record<string, { label: string; keyword: string }[]> = {};
  const groupOrder: string[] = [];
  for (const m of list) {
    if (!byGroup[m.groupLabel]) {
      byGroup[m.groupLabel] = [];
      groupOrder.push(m.groupLabel);
    }
    byGroup[m.groupLabel].push({ label: m.label, keyword: m.keyword });
  }

  const lines: string[] = [];
  lines.push("");
  lines.push("추가 옵션 (반드시 5장 카드 모두에 일관되게 반영하세요):");
  for (const groupLabel of groupOrder) {
    const items = byGroup[groupLabel];
    const labels = items.map((i) => i.label).join(", ");
    const keywords = items.map((i) => i.keyword).join("; ");
    lines.push(`- ${groupLabel} (${labels}): ${keywords}`);
  }
  lines.push("");
  lines.push(
    "주의: 위 옵션은 5장 모든 카드의 시간대·계절·렌즈·텍토닉 방향을 통일시키되, 카드의 무드(styleLabel) 다양성은 그대로 유지하세요. 영문 프롬프트 본문에 자연스럽게 녹여 넣고, 별도 메타 라벨로 나열하지 마세요."
  );
  return lines.join("\n");
}

export class GeminiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "GeminiError";
  }
}

export async function generatePromptCards(opts: GenerateOptions): Promise<PromptCard[]> {
  const { apiKey, conceptKo, engine, modifiers } = opts;

  if (!apiKey || apiKey.trim().length < 8) {
    throw new GeminiError("NO_KEY", "API 키가 설정되지 않았습니다.");
  }
  if (!conceptKo || conceptKo.trim().length < 2) {
    throw new GeminiError("BAD_INPUT", "컨셉을 입력해 주세요.");
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    systemInstruction: SYSTEM_PROMPT_BASE + engineDirective(engine),
    generationConfig: {
      temperature: 0.85,
      topP: 0.95,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const modifierBlock = buildModifierBlock(modifiers);
  const userPrompt = `한글 컨셉:\n"""${conceptKo.trim()}"""\n${modifierBlock}\n\n위 컨셉을 ${engine === "midjourney" ? "Midjourney v8.1" : "Stable Diffusion"} 용으로 5개의 카드로 확장해 주세요. 각 카드는 서로 다른 무드여야 하고, 재질·공간감·조명·카메라 4요소를 자연스럽게 포함해야 합니다. JSON만 출력하세요.`;

  let text: string;
  try {
    const result = await model.generateContent(userPrompt);
    text = result.response.text();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/API key/i.test(message) || /API_KEY_INVALID/i.test(message) || /401|403/.test(message)) {
      throw new GeminiError("INVALID_KEY", "API 키가 유효하지 않습니다. 키를 다시 확인해 주세요.");
    }
    if (/quota|429|RESOURCE_EXHAUSTED/i.test(message)) {
      throw new GeminiError("QUOTA", "Gemini 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 결제 한도를 확인해 주세요.");
    }
    if (/SAFETY|blocked/i.test(message)) {
      throw new GeminiError("SAFETY", "안전 필터에 걸렸습니다. 컨셉 표현을 조금 바꿔서 다시 시도해 주세요.");
    }
    if (/network|fetch|ENOTFOUND|ECONNRESET|timed out/i.test(message)) {
      throw new GeminiError("NETWORK", "네트워크 오류로 Gemini에 연결하지 못했습니다. 다시 시도해 주세요.");
    }
    throw new GeminiError("UNKNOWN", `Gemini 호출 중 오류가 발생했습니다: ${message}`);
  }

  let parsed: unknown;
  try {
    parsed = safeJsonParse(text);
  } catch {
    throw new GeminiError("PARSE", "AI 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.");
  }

  const root = parsed as { cards?: RawCard[] };
  const rawCards = Array.isArray(root.cards) ? root.cards : [];
  if (rawCards.length === 0) {
    throw new GeminiError("EMPTY", "AI 응답에 카드가 포함되어 있지 않습니다. 다시 시도해 주세요.");
  }

  const seenLabels = new Set<string>();
  const cards: PromptCard[] = [];
  for (const raw of rawCards.slice(0, 5)) {
    const styleLabel = asString(raw.styleLabel, "Architectural Mood");
    const styleLabelKo = asString(raw.styleLabelKo, styleLabel);
    if (seenLabels.has(styleLabel.toLowerCase())) continue;
    seenLabels.add(styleLabel.toLowerCase());

    const promptOnly = asString(raw.promptOnly);
    if (!promptOnly) continue;
    const parameters = asString(raw.parameters);
    const negative = asString(raw.negative);
    const intentKo = asString(raw.intentKo);

    const built = buildFullPrompt(engine, { promptOnly, parameters, negative });
    const elements = asElements(raw.elements);

    cards.push({
      id: `card_${Date.now()}_${cards.length}`,
      styleLabel,
      styleLabelKo,
      intentKo,
      promptOnly,
      promptFull: built,
      parameters: parameters || undefined,
      negative: negative || undefined,
      elements,
    });
  }

  if (cards.length === 0) {
    throw new GeminiError("EMPTY", "AI 응답에서 유효한 카드를 찾지 못했습니다. 다시 시도해 주세요.");
  }
  return cards;
}
