const REPO = "https://github.com/gitpushnico/stonkfun-tracking";

const SECTIONS = [
  {
    title: "What this is",
    body: "Unofficial companion to StonkFun. The official site sorts by one thing at a time. This page combines market cap, 24h volume, and age in the browser.",
  },
  {
    title: "Does it update by itself?",
    body: "Yes, while the tab is open and not paused. Every 15 seconds it pulls the newest pages. Every 2 minutes it does a full rescan of the age window. New rows get a short highlight. Closing the tab, or Pause, stops the polling.",
  },
  {
    title: "Refresh",
    body: "Runs a full rescan now, same as the 2-minute pass. Use it after you change age, or if the list looks stale.",
  },
  {
    title: "Pause / Resume",
    body: "Stops or starts the automatic updates. The current list stays.",
  },
  {
    title: "Reset",
    body: "Puts filters back to 4 – 25k market cap, $1,000 min volume, last 24 hours, sort newest.",
  },
  {
    title: "Market cap",
    body: "USD. Tokens outside min–max are hidden. 4000 – 25000 is $4k – $25k.",
  },
  {
    title: "Min. volume (24h)",
    body: "USD traded in the last 24 hours. 1000 means at least $1,000. 0 includes everything.",
  },
  {
    title: "Age",
    body: "How far back to scan. 24 hours reads more pages and takes longer. All still caps the scan so the full catalog is not pulled.",
  },
  {
    title: "Sort",
    body: "Order of the already filtered list. It does not change what is included.",
  },
  {
    title: "Pair",
    body: "Quote asset or category from StonkFun (SOL, xStock, GP, …). All means no pair filter.",
  },
  {
    title: "Status",
    body: "New = still on the curve. Near = about to graduate. Graduated = already off the curve.",
  },
] as const;

export function Info() {
  return (
    <section className="info" aria-label="Info">
      <dl>
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <dt>{section.title}</dt>
            <dd>{section.body}</dd>
          </div>
        ))}
        <div>
          <dt>Source</dt>
          <dd>
            <a href={REPO} target="_blank" rel="noreferrer">
              {REPO.replace("https://", "")}
            </a>
            . Open an issue to request a change. Pull requests welcome. Not affiliated with StonkFun.
          </dd>
        </div>
      </dl>
    </section>
  );
}
