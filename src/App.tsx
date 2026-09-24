import { useEffect, useState } from "react";
import { Controls } from "./components/Controls";
import { Info } from "./components/Info";
import { Results } from "./components/Results";
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
    <div className="app">
      <header className="mast">
        <div>
          <h1>StonkFun Tracking</h1>
          <p className="tag">Filter tokens by market cap, volume, and age.</p>
        </div>
        <div className="mast-meta">
          <p>
            {scan.status === "loading" && scan.scanned === 0
              ? "Loading tokens…"
              : scan.status === "loading"
                ? `${count} found · loading ${scan.pagesLoaded}/${scan.pageTarget}`
                : scan.status === "error"
                  ? scan.error
                  : `${count} found${scan.updatedAt ? ` · ${clock(new Date(scan.updatedAt))}` : ""}`}
          </p>
          <div className="mast-actions">
            <button type="button" className="text-link" onClick={() => scan.setLive((on) => !on)}>
              {scan.live ? "Pause" : "Resume"}
            </button>
            <button type="button" className="text-link" onClick={() => void scan.refresh()}>
              Refresh
            </button>
            <button type="button" className="text-link" onClick={() => scan.setFilters(DEFAULT_FILTERS)}>
              Reset
            </button>
            <button
              type="button"
              className={infoOpen ? "text-link on" : "text-link"}
              aria-expanded={infoOpen}
              onClick={() => setInfoOpen((open) => !open)}
            >
              Info
            </button>
          </div>
        </div>
      </header>

      {infoOpen && <Info />}

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
