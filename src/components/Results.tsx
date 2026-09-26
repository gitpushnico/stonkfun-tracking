import type { CSSProperties } from "react";
import { assetUrl, tokenUrl } from "../api";
import { ageLabel, usd } from "../format";
import type { Token } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  tokens: Token[];
  freshMints: Set<string>;
  now: number;
  emptyReason: string;
};

export function Results({ tokens, freshMints, now, emptyReason }: Props) {
  if (tokens.length === 0) {
    return (
      <div className="grid min-h-40 items-center">
        <p className="m-0 max-w-[40ch] text-muted-foreground">{emptyReason}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Token</TableHead>
          <TableHead>Pair</TableHead>
          <TableHead className="text-right">Market cap</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="text-right">Age</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((token, index) => (
          <TableRow
            key={token.mint}
            className={`row-rise relative ${freshMints.has(token.mint) ? "bg-card" : ""}`}
            style={{ "--i": Math.min(index, 8) } as CSSProperties}
          >
            <TableCell>
              <a
                className="flex min-w-0 items-center gap-3 text-inherit no-underline after:absolute after:inset-0"
                href={tokenUrl(token.mint)}
                target="_blank"
                rel="noreferrer"
              >
                <TokenArt token={token} />
                <span className="grid min-w-0">
                  <strong className="font-semibold">{token.symbol}</strong>
                  <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8rem] text-muted-foreground">
                    {token.name}
                  </small>
                </span>
              </a>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">{token.quote.symbol}</TableCell>
            <TableCell className="text-right tabular-nums">{usd(token.market.marketCapUsd)}</TableCell>
            <TableCell className="text-right tabular-nums">{usd(token.market.volume24hUsd)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {ageLabel(token.createdAt, now)}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{statusLabel(token.status)}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TokenArt({ token }: { token: Token }) {
  const src = assetUrl(token.imageUrl);
  if (src) {
    return <img src={src} alt="" className="size-7 shrink-0 rounded-sm bg-card object-cover" />;
  }
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-card text-[0.7rem] text-muted-foreground">
      {token.symbol.slice(0, 2)}
    </span>
  );
}

function statusLabel(status: string): string {
  if (status === "aboutToGraduate") return "Near";
  if (status === "graduated") return "Graduated";
  return "New";
}
