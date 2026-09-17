import { Controls } from "./components/Controls";
import { Tape } from "./components/Tape";
import { clock, usd } from "./format";
import { DEFAULT_FILTERS, useScanner } from "./useScanner";

export default function App() {
  const scan = useScanner();
  const { filters } = scan;

  const emptyReason = emptyCopy(scan.matches.length, scan.scanned, scan.status);

  return (
    <div className="app">
      <header className="mast">
        <div className="brand">
          <p className="mark">Long Filt</p>
          <p className="tag">StonkFun combined scan</p>
        </div>
        <dl className="board">
          <div>
            <dt>Matches</dt>
            <dd>{scan.matches.length}</dd>
          </div>
          <div>
            <dt>Scanned</dt>
            <dd>{scan.scanned.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt>Mcap band</dt>
            <dd>
              {usd(filters.mcapMin)}–{usd(filters.mcapMax)}
            </dd>
          </div>
          <div>
            <dt>Min vol</dt>
            <dd>{filters.volMin <= 0 ? "any" : usd(filters.volMin)}</dd>
          </div>
        </dl>
        <div className="live-box">
          <p className={scan.live ? "clock live" : "clock"}>{clock(new Date(scan.now))}</p>
          <div className="live-actions">
            <button
              type="button"
              className={scan.live ? "chip chip-on" : "chip"}
              onClick={() => scan.setLive((on) => !on)}
            >
              {scan.live ? "Live" : "Paused"}
            </button>
            <button type="button" className="chip" onClick={() => void scan.refresh()}>
              Rescan
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => scan.setFilters(DEFAULT_FILTERS)}
            >
              Reset
            </button>
          </div>
          <p className="scan-meta">
            {scan.status === "loading"
              ? `Reading newest · ${scan.pagesLoaded}/${scan.pageTarget} pages`
              : scan.status === "error"
                ? scan.error
                : scan.updatedAt
                  ? `Updated ${clock(new Date(scan.updatedAt))}`
                  : "Waiting"}
          </p>
        </div>
      </header>

      <Controls filters={filters} onChange={scan.setFilters} categories={scan.categories} />

      <Tape
        tokens={scan.matches}
        freshMints={scan.freshMints}
        now={scan.now}
        emptyReason={emptyReason}
      />
    </div>
  );
}

function emptyCopy(matches: number, scanned: number, status: string): string {
  if (matches > 0) return "";
  if (status === "loading" && scanned === 0) {
    return "Pulling the newest tape from StonkFun…";
  }
  if (status === "error") {
    return "Could not reach StonkFun. Hit rescan.";
  }
  return "Nothing in this band. Most fresh launches sit under $4k — wait for a print, drop the floor, or lower min volume.";
}
