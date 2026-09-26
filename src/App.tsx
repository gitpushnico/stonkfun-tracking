import { useEffect, useState } from "react";
import { Controls } from "./components/Controls";
import { Info } from "./components/Info";
import { Results } from "./components/Results";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { clock } from "./format";
import { DEFAULT_FILTERS, useScanner } from "./useScanner";

export default function App() {
  const scan = useScanner();
  const { filters } = scan;
  const count = scan.matches.length;
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!infoOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInfoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [infoOpen]);

  return (
    <div className="mx-auto grid w-[min(1080px,calc(100%-40px))] gap-10 py-10 pb-16">
      <header className="flex items-end justify-between gap-6 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <h1 className="m-0 text-[1.35rem] font-semibold tracking-tight">StonkFun Tracking</h1>
          <p className="mt-1.5 max-w-[42ch] text-[0.95rem] text-muted-foreground">
            Filter tokens by market cap, volume, and age.
          </p>
        </div>
        <div className="grid justify-items-end gap-2 text-right max-[860px]:justify-items-start max-[860px]:text-left">
          <p className="m-0 text-[0.9rem] text-muted-foreground">
            {scan.status === "loading" && scan.scanned === 0
              ? "Loading tokens…"
              : scan.status === "loading"
                ? `${count} found · loading ${scan.pagesLoaded}/${scan.pageTarget}`
                : scan.status === "error"
                  ? scan.error
                  : `${count} found${scan.updatedAt ? ` · ${clock(new Date(scan.updatedAt))}` : ""}`}
          </p>
          <div className="flex justify-end gap-1 max-[860px]:justify-start">
            <Button variant="ghost" size="sm" onClick={() => scan.setLive((on) => !on)}>
              {scan.live ? "Pause" : "Resume"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void scan.refresh()}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => scan.setFilters(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={infoOpen}
              onClick={() => setInfoOpen((open) => !open)}
            >
              Info
            </Button>
          </div>
        </div>
      </header>

      {infoOpen && (
        <>
          <Separator />
          <Info />
        </>
      )}

      <Controls filters={filters} onChange={scan.setFilters} categories={scan.categories} />

      <Results
        tokens={scan.matches}
        freshMints={scan.freshMints}
        now={scan.now}
        emptyReason={emptyCopy(count, scan.scanned, scan.status)}
      />
    </div>
  );
}

function emptyCopy(matches: number, scanned: number, status: string): string {
  if (matches > 0) return "";
  if (status === "loading" && scanned === 0) return "Loading tokens…";
  if (status === "error") return "Could not load data. Try Refresh.";
  return "No tokens match. Try a wider market cap or a lower volume.";
}
