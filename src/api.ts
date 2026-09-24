import type { Token } from "./types";

const API = "https://www.stonkfun.xyz/api/public/v1";
const PAGE_SIZE = 100;
const CONCURRENCY = 5;

type TokensResponse = {
  data: {
    tokens: Token[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
};

export function tokenUrl(mint: string): string {
  return `https://www.stonkfun.xyz/token/${mint}`;
}

export function assetUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://www.stonkfun.xyz${url}`;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (response.status === 429) {
    const retry = Number(response.headers.get("Retry-After") ?? "2");
    await wait((Number.isFinite(retry) ? retry : 2) * 1000, signal);
    return fetchJson<T>(url, signal);
  }
  if (!response.ok) {
    throw new Error(`StonkFun ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function scanNewest(options: {
  maxPages: number;
  cutoff: number | null;
  signal?: AbortSignal;
  onProgress?: (loaded: number, target: number, tokens: Token[]) => void;
}): Promise<{ tokens: Token[]; pagesLoaded: number; catalogTotal: number }> {
  const byMint = new Map<string, Token>();
  let page = 1;
  let pagesLoaded = 0;
  let catalogTotal = 0;
  let stop = false;

  while (page <= options.maxPages && !stop) {
    const batch: number[] = [];
    for (let i = 0; i < CONCURRENCY && page + i <= options.maxPages; i += 1) {
      batch.push(page + i);
    }

    const results = await Promise.all(
      batch.map(async (p) => {
        const url = `${API}/tokens?sort=newest&page=${p}&pageSize=${PAGE_SIZE}`;
        const body = await fetchJson<TokensResponse>(url, options.signal);
        catalogTotal = body.data.pagination.total;
        return { page: p, tokens: body.data.tokens };
      }),
    );

    results.sort((a, b) => a.page - b.page);

    for (const result of results) {
      pagesLoaded += 1;
      for (const token of result.tokens) byMint.set(token.mint, token);
      const last = result.tokens[result.tokens.length - 1];
      if (result.tokens.length < PAGE_SIZE) stop = true;
      if (options.cutoff && last && new Date(last.createdAt).getTime() < options.cutoff) {
        stop = true;
      }
    }

    options.onProgress?.(pagesLoaded, options.maxPages, [...byMint.values()]);
    page += batch.length;
  }

  return { tokens: [...byMint.values()], pagesLoaded, catalogTotal };
}
