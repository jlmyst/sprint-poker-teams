export const CARDS = ["0", "1", "2", "3", "5", "8", "13", "21", "?"] as const;
export type Card = (typeof CARDS)[number];

export interface Stats {
  count: number;
  mean: number;
  modes: number[];
}

/** Stats over numeric votes only — "?" is shown but not counted. */
export function computeStats(votes: Card[]): Stats | null {
  const nums = votes
    .filter((v) => v !== "?")
    .map(Number)
    .sort((a, b) => a - b); // sorted so multiple modes list low to high
  if (nums.length === 0) return null;

  const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const modes = [...counts].filter(([, c]) => c === top).map(([n]) => n);

  return { count: nums.length, mean, modes };
}

export function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
