import type { CSSProperties } from "react";
import { assetUrl, tokenUrl } from "../api";
import { ageLabel, usd } from "../format";
import type { Token } from "../types";

type Props = {
  tokens: Token[];
  freshMints: Set<string>;
  now: number;
  emptyReason: string;
};

export function Results({ tokens, freshMints, now, emptyReason }: Props) {
  if (tokens.length === 0) {
    return (
      <div className="empty">
        <p>{emptyReason}</p>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="results-head">
        <span>Token</span>
        <span>Pair</span>
        <span>Market cap</span>
        <span>Volume</span>
        <span>Age</span>
        <span>Status</span>
      </div>
      <div>
        {tokens.map((token, index) => (
          <a
            key={token.mint}
            className={freshMints.has(token.mint) ? "row fresh" : "row"}
            href={tokenUrl(token.mint)}
            target="_blank"
            rel="noreferrer"
            style={{ "--i": Math.min(index, 8) } as CSSProperties}
          >
            <span className="token-cell">
              <TokenArt token={token} />
              <span>
                <strong>{token.symbol}</strong>
                <small>{token.name}</small>
              </span>
            </span>
            <span className="pair-cell">{token.quote.symbol}</span>
            <span className="num">{usd(token.market.marketCapUsd)}</span>
            <span className="num">{usd(token.market.volume24hUsd)}</span>
            <span className="num dim">{ageLabel(token.createdAt, now)}</span>
            <span className="status">{statusLabel(token.status)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function TokenArt({ token }: { token: Token }) {
  const src = assetUrl(token.imageUrl);
  if (src) return <img src={src} alt="" />;
  return <span className="fallback">{token.symbol.slice(0, 2)}</span>;
}

function statusLabel(status: string): string {
  if (status === "aboutToGraduate") return "Near";
  if (status === "graduated") return "Graduated";
  return "New";
}
