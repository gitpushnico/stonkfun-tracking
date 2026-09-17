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

export function Tape({ tokens, freshMints, now, emptyReason }: Props) {
  if (tokens.length === 0) {
    return (
      <div className="empty">
        <p>{emptyReason}</p>
      </div>
    );
  }

  return (
    <div className="tape">
      <div className="tape-head">
        <span>Token</span>
        <span>Pair</span>
        <span>Mkt cap</span>
        <span>24h vol</span>
        <span>Age</span>
        <span>Curve</span>
      </div>
      <div className="tape-body">
        {tokens.map((token, index) => (
          <a
            key={token.mint}
            className={freshMints.has(token.mint) ? "row fresh" : "row"}
            href={tokenUrl(token.mint)}
            target="_blank"
            rel="noreferrer"
            style={{ "--i": Math.min(index, 12) } as CSSProperties}
          >
            <span className="token-cell">
              <TokenArt token={token} />
              <span>
                <strong>{token.symbol}</strong>
                <small>{token.name}</small>
              </span>
            </span>
            <span className="pair-cell">
              {assetUrl(token.quote.logoUrl) ? (
                <img src={assetUrl(token.quote.logoUrl)} alt="" />
              ) : (
                <span className="fallback">{token.quote.symbol.slice(0, 2)}</span>
              )}
              <span>
                <strong>{token.quote.symbol}</strong>
                <small>{token.quote.categoryLabel}</small>
              </span>
            </span>
            <span className="num">{usd(token.market.marketCapUsd)}</span>
            <span className="num">{usd(token.market.volume24hUsd)}</span>
            <span className="age">{ageLabel(token.createdAt, now)}</span>
            <span className="curve">
              <i style={{ width: `${Math.min(100, token.graduationProgress * 100)}%` }} />
              <em>{statusLabel(token.status)}</em>
            </span>
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
  if (status === "aboutToGraduate") return "near";
  if (status === "graduated") return "out";
  return "new";
}
