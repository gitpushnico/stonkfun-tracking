import type { AgePreset, Filters, Token } from "./types";

export const AGE_MS: Record<Exclude<AgePreset, "any">, number> = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

export function ageCutoff(age: AgePreset, now = Date.now()): number | null {
  if (age === "any") return null;
  return now - AGE_MS[age];
}

export function applyFilters(tokens: Token[], filters: Filters, now = Date.now()): Token[] {
  const cutoff = ageCutoff(filters.age, now);
  const next = tokens.filter((token) => {
    const mcap = token.market.marketCapUsd;
    const vol = token.market.volume24hUsd;
    if (mcap < filters.mcapMin || mcap > filters.mcapMax) return false;
    if (vol < filters.volMin) return false;
    if (cutoff && new Date(token.createdAt).getTime() < cutoff) return false;
    if (filters.category && token.quote.categoryLabel !== filters.category) return false;
    return true;
  });

  next.sort((a, b) => {
    if (filters.sort === "volume") return b.market.volume24hUsd - a.market.volume24hUsd;
    if (filters.sort === "marketCap") return b.market.marketCapUsd - a.market.marketCapUsd;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return next;
}

export const PRESETS = [
  { id: "band", label: "4 – 25k", mcapMin: 4_000, mcapMax: 25_000, volMin: 1_000, age: "24h" as const },
  { id: "ten", label: "~10k", mcapMin: 8_000, mcapMax: 12_000, volMin: 1_000, age: "24h" as const },
  { id: "early", label: "Under 5k", mcapMin: 0, mcapMax: 5_000, volMin: 500, age: "6h" as const },
] as const;
