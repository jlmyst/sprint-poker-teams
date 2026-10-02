export const CARDS = ["0", "1", "2", "3", "5", "8", "13", "21", "?"] as const;
export type Card = (typeof CARDS)[number];

export interface Stats {
  count: number;
  mean: number;
  median: number;
  modes: number[];
}

/** Stats over numeric votes only — "?" is shown but not counted. */
export function computeStats(votes: Card[]): Stats | null {
  const nums = votes
    .filter((v) => v !== "?")
    .map(Number)
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;

  const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
  const mid = Math.floor(nums.length / 2);
  const median = nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const modes = [...counts].filter(([, c]) => c === top).map(([n]) => n);

  return { count: nums.length, mean, median, modes };
}

export function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
