export type ModifierGroupId = "timeOfDay" | "season" | "camera" | "mood";

export interface ModifierOption {
  id: string;
  label: string;
  /** English keyword string injected into the Gemini user prompt as guidance */
  keyword: string;
}

export interface ModifierGroup {
  id: ModifierGroupId;
  label: string;
  description: string;
  options: ModifierOption[];
}

export const MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: "timeOfDay",
    label: "시간대",
    description: "조명·분위기를 결정합니다",
    options: [
      {
        id: "morning",
        label: "아침",
        keyword:
          "early morning, soft golden raking sunrise, long blue shadows, calm atmosphere",
      },
      {
        id: "day",
        label: "낮",
        keyword:
          "midday clear daylight, crisp shadow lines, bright neutral white balance",
      },
      {
        id: "dusk",
        label: "황혼",
        keyword:
          "golden hour dusk, warm amber rim light, low sun, deep elongated shadows, twilight glow",
      },
      {
        id: "night",
        label: "야경",
        keyword:
          "night exterior shot, theatrical interior glow spilling through openings, deep blue sky, ambient streetlight",
      },
    ],
  },
  {
    id: "season",
    label: "계절",
    description: "주변 식생·기후를 통일합니다",
    options: [
      {
        id: "spring",
        label: "봄",
        keyword:
          "spring season, fresh young green foliage, scattered cherry blossom petals, soft warm daylight",
      },
      {
        id: "summer",
        label: "여름",
        keyword:
          "summer season, lush dense green vegetation, strong sun, deep cast shadows, occasional cumulus clouds",
      },
      {
        id: "autumn",
        label: "가을",
        keyword:
          "autumn season, warm amber and crimson foliage, low golden sun, soft morning mist",
      },
      {
        id: "winter",
        label: "겨울",
        keyword:
          "winter season, snow-dusted ground, bare deciduous trees, cool overcast diffuse light, subtle frost",
      },
    ],
  },
  {
    id: "camera",
    label: "카메라",
    description: "프레이밍·렌즈를 강제합니다",
    options: [
      {
        id: "wide",
        label: "광각",
        keyword:
          "ultra-wide architectural composition, 16mm tilt-shift lens, generous environmental context, slight upward perspective",
      },
      {
        id: "standard",
        label: "표준",
        keyword:
          "standard 35mm prime lens, natural human-scale perspective, eye-level framing",
      },
      {
        id: "tele",
        label: "망원",
        keyword:
          "85mm telephoto compression, abstract façade detail, layered planes, shallow depth of field",
      },
      {
        id: "drone",
        label: "드론",
        keyword:
          "high-altitude aerial drone shot, oblique birds-eye view, master plan readability, soft atmospheric haze",
      },
    ],
  },
  {
    id: "mood",
    label: "분위기",
    description: "5장 전체의 텍토닉 방향을 강조",
    options: [
      {
        id: "minimal",
        label: "미니멀",
        keyword:
          "extreme minimalism, restrained monochrome materiality, generous negative space, refined detailing",
      },
      {
        id: "organic",
        label: "유기적",
        keyword:
          "organic biophilic forms, natural curves, integration of timber and stone, planted volumes, flowing geometry",
      },
      {
        id: "brutalist",
        label: "브루탈리스트",
        keyword:
          "brutalist tectonics, raw exposed concrete (béton brut), heavy massing, deep recessed openings, sculptural shadow",
      },
      {
        id: "hightech",
        label: "하이테크",
        keyword:
          "hi-tech parametric architecture, exposed steel structure, glazed facades, mechanical articulation, precision detailing",
      },
    ],
  },
];

export type ModifierSelection = Partial<Record<ModifierGroupId, string[]>>;

export function emptyModifierSelection(): ModifierSelection {
  return {};
}

export function isModifierSelected(
  selection: ModifierSelection,
  group: ModifierGroupId,
  optionId: string
): boolean {
  return (selection[group] ?? []).includes(optionId);
}

export function toggleModifier(
  selection: ModifierSelection,
  group: ModifierGroupId,
  optionId: string
): ModifierSelection {
  const current = selection[group] ?? [];
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
  return { ...selection, [group]: next };
}

export function clearGroup(
  selection: ModifierSelection,
  group: ModifierGroupId
): ModifierSelection {
  const next = { ...selection };
  delete next[group];
  return next;
}

/** Total number of selected chips across all groups. */
export function countSelected(selection: ModifierSelection): number {
  return Object.values(selection).reduce(
    (sum, arr) => sum + (arr?.length ?? 0),
    0
  );
}

/**
 * Return a structured list of {group, label, keyword} for currently selected
 * options, in stable group order. Used by the Gemini client to assemble
 * user-prompt guidance text.
 */
export function resolveModifiers(
  selection: ModifierSelection
): { groupId: ModifierGroupId; groupLabel: string; label: string; keyword: string }[] {
  const out: {
    groupId: ModifierGroupId;
    groupLabel: string;
    label: string;
    keyword: string;
  }[] = [];
  for (const group of MODIFIER_GROUPS) {
    const ids = selection[group.id] ?? [];
    if (ids.length === 0) continue;
    for (const id of ids) {
      const opt = group.options.find((o) => o.id === id);
      if (opt) {
        out.push({
          groupId: group.id,
          groupLabel: group.label,
          label: opt.label,
          keyword: opt.keyword,
        });
      }
    }
  }
  return out;
}
