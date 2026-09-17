export type Quote = {
  mint: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  category: string;
  categoryLabel: string;
};

export type Market = {
  priceUsd: number;
  marketCapUsd: number;
  fdvUsd: number;
  volume24hUsd: number;
  liquidityUsd: number;
  peakMarketCapUsd: number;
};

export type Token = {
  mint: string;
  pool: string;
  name: string;
  symbol: string;
  quote: Quote;
  launchpad: string;
  mode: string;
  imageUrl?: string;
  market: Market;
  status: "new" | "aboutToGraduate" | "graduated" | string;
  graduationProgress: number;
  createdAt: string;
};

export type SortKey = "newest" | "volume" | "marketCap";

export type AgePreset = "1h" | "6h" | "24h" | "any";

export type Filters = {
  mcapMin: number;
  mcapMax: number;
  volMin: number;
  age: AgePreset;
  sort: SortKey;
  category: string | null;
};
