export type CompetitionLevel = "low" | "medium" | "high";

export type CompetitionAnalysis = {
  nicheCompetitors: number;
  level: CompetitionLevel;
  levelLabel: string;
  searchCompetitorsCount: number;
  activityLabel: "Низкая" | "Средняя" | "Высокая";
  avgCheck: number;
  topChanceMin: number;
  topChanceMax: number;
};

function fnv1a(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Детерминированная модель конкуренции на основе FNV-1a.
 * Одинаковая тройка (сфера, услуга, регион) всегда даёт одинаковые метрики.
 */
export function computeCompetitionAnalysis(
  sphere: string,
  service: string,
  region: string,
): CompetitionAnalysis {
  const seed = fnv1a(`${sphere.trim()}|${service.trim()}|${region.trim()}`);
  const roll = (salt: number) => fnv1a(`${seed}:${salt}`);

  const nicheCompetitors = roll(1) % 101;

  let level: CompetitionLevel;
  let levelLabel: string;
  if (nicheCompetitors <= 10) {
    level = "low";
    levelLabel = "Низкий";
  } else if (nicheCompetitors <= 30) {
    level = "medium";
    levelLabel = "Средний";
  } else {
    level = "high";
    levelLabel = "Высокий";
  }

  const searchCompetitorsCount = 400 + (roll(2) % 9600);

  const activityIdx = roll(3) % 3;
  const activityLabel = (["Низкая", "Средняя", "Высокая"] as const)[activityIdx];

  const avgCheck = 1500 + (roll(4) % 18500);

  const topChanceMin = 35 + (roll(5) % 36);
  const span = 8 + (roll(6) % 18);
  const topChanceMax = Math.min(94, topChanceMin + span);

  return {
    nicheCompetitors,
    level,
    levelLabel,
    searchCompetitorsCount,
    activityLabel,
    avgCheck,
    topChanceMin,
    topChanceMax,
  };
}
