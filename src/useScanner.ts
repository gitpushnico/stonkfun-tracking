import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scanNewest } from "./api";
import { ageCutoff, applyFilters } from "./filters";
import type { Filters, Token } from "./types";

const STORAGE_KEY = "long-filt.filters.v1";

export const DEFAULT_FILTERS: Filters = {
  mcapMin: 4_000,
  mcapMax: 25_000,
  volMin: 1_000,
  age: "24h",
  sort: "newest",
  category: null,
};

function loadFilters(): Filters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function maxPagesForAge(age: Filters["age"]): number {
  if (age === "1h") return 12;
  if (age === "6h") return 36;
  if (age === "24h") return 72;
  return 40;
}

function mergePool(current: Token[], incoming: Token[], cutoff: number | null): Token[] {
  const byMint = new Map(current.map((token) => [token.mint, token]));
  for (const token of incoming) byMint.set(token.mint, token);
  const next = [...byMint.values()];
  if (!cutoff) return next;
  return next.filter((token) => new Date(token.createdAt).getTime() >= cutoff);
}

export function useScanner() {
  const [filters, setFilters] = useState<Filters>(loadFilters);
  const [pool, setPool] = useState<Token[]>([]);
  const [freshMints, setFreshMints] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "loading" | "live" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [pageTarget, setPageTarget] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [live, setLive] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const abortRef = useRef<AbortController | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);
  const poolRef = useRef<Token[]>([]);
  const scanningRef = useRef(false);

  useEffect(() => {
    poolRef.current = pool;
  }, [pool]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  const runScan = useCallback(async (mode: "full" | "tick") => {
    if (scanningRef.current && mode === "tick") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    scanningRef.current = true;
    const target = mode === "tick" ? 4 : maxPagesForAge(filters.age);
    setPageTarget(target);
    if (mode === "full") setStatus("loading");
    setError(null);

    try {
      const cutoff = ageCutoff(filters.age);
      const result = await scanNewest({
        maxPages: target,
        cutoff,
        signal: controller.signal,
        onProgress: (loaded, max, tokens) => {
          setPagesLoaded(loaded);
          setPageTarget(max);
          const shown = mode === "full" ? tokens : mergePool(poolRef.current, tokens, cutoff);
          setPool(shown);
          setScanned(shown.length);
        },
      });
      if (controller.signal.aborted) return;

      const merged = mode === "full" ? result.tokens : mergePool(poolRef.current, result.tokens, cutoff);
      const nextFresh = new Set<string>();
      if (!firstLoad.current) {
        for (const token of merged) {
          if (!seenRef.current.has(token.mint)) nextFresh.add(token.mint);
        }
      }
      for (const token of merged) seenRef.current.add(token.mint);
      firstLoad.current = false;

      setPool(merged);
      setFreshMints(nextFresh);
      setScanned(merged.length);
      setCatalogTotal(result.catalogTotal);
      setPagesLoaded(result.pagesLoaded);
      setUpdatedAt(Date.now());
      setStatus("live");
      if (nextFresh.size) {
        window.setTimeout(() => setFreshMints(new Set()), 12_000);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Could not load data";
      setError(message);
      setStatus("error");
    } finally {
      if (abortRef.current === controller) scanningRef.current = false;
    }
  }, [filters.age]);

  useEffect(() => {
    void runScan("full");
    return () => abortRef.current?.abort();
  }, [runScan]);

  useEffect(() => {
    if (!live) return;
    const tick = window.setInterval(() => {
      void runScan("tick");
    }, 15_000);
    const deep = window.setInterval(() => {
      void runScan("full");
    }, 120_000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(deep);
    };
  }, [live, runScan]);

  const matches = useMemo(() => applyFilters(pool, filters, now), [pool, filters, now]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const token of pool) {
      const label = token.quote.categoryLabel;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [pool]);

  return {
    filters,
    setFilters,
    matches,
    freshMints,
    status,
    error,
    pagesLoaded,
    pageTarget,
    scanned,
    catalogTotal,
    updatedAt,
    live,
    setLive,
    now,
    categories,
    refresh: () => runScan("full"),
  };
}
