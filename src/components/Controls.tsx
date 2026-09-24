import { PRESETS } from "../filters";
import type { AgePreset, Filters, SortKey } from "../types";

const AGES: { id: AgePreset; label: string }[] = [
  { id: "1h", label: "1 hour" },
  { id: "6h", label: "6 hours" },
  { id: "24h", label: "24 hours" },
  { id: "any", label: "All" },
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "volume", label: "Volume" },
  { id: "marketCap", label: "Market cap" },
];

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories: [string, number][];
};

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function Controls({ filters, onChange, categories }: Props) {
  const patch = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const setMcap = (min: number, max: number) => {
    const lo = Math.max(0, Math.min(min, max));
    patch({ mcapMin: lo, mcapMax: Math.max(lo, max) });
  };

  return (
    <section className="controls" aria-label="Filters">
      <div className="control-grid">
        <fieldset className="field">
          <legend>Market cap</legend>
          <div className="pair">
            <label>
              <span className="sr-only">Minimum</span>
              <input
                inputMode="numeric"
                value={filters.mcapMin}
                onChange={(e) => setMcap(parseAmount(e.target.value), filters.mcapMax)}
              />
            </label>
            <span className="pair-join">–</span>
            <label>
              <span className="sr-only">Maximum</span>
              <input
                inputMode="numeric"
                value={filters.mcapMax}
                onChange={(e) => setMcap(filters.mcapMin, parseAmount(e.target.value))}
              />
            </label>
          </div>
          <div className="text-links" role="group" aria-label="Quick ranges">
            {PRESETS.map((preset) => {
              const active =
                filters.mcapMin === preset.mcapMin &&
                filters.mcapMax === preset.mcapMax &&
                filters.volMin === preset.volMin &&
                filters.age === preset.age;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={active ? "text-link on" : "text-link"}
                  onClick={() =>
                    onChange({
                      ...filters,
                      mcapMin: preset.mcapMin,
                      mcapMax: preset.mcapMax,
                      volMin: preset.volMin,
                      age: preset.age,
                    })
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Min. volume (24h)</legend>
          <label className="solo">
            <span className="sr-only">Minimum volume</span>
            <input
              inputMode="numeric"
              value={filters.volMin}
              onChange={(e) => patch({ volMin: parseAmount(e.target.value) })}
            />
          </label>
        </fieldset>

        <fieldset className="field">
          <legend>Age</legend>
          <div className="seg" role="group">
            {AGES.map((age) => (
              <button
                key={age.id}
                type="button"
                className={filters.age === age.id ? "seg-btn on" : "seg-btn"}
                onClick={() => patch({ age: age.id })}
              >
                {age.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Sort</legend>
          <div className="seg" role="group">
            {SORTS.map((sort) => (
              <button
                key={sort.id}
                type="button"
                className={filters.sort === sort.id ? "seg-btn on" : "seg-btn"}
                onClick={() => patch({ sort: sort.id })}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {categories.length > 0 && (
        <label className="pair-filter">
          <span>Pair</span>
          <select
            value={filters.category ?? ""}
            onChange={(e) => patch({ category: e.target.value || null })}
          >
            <option value="">All</option>
            {categories.map(([label, count]) => (
              <option key={label} value={label}>
                {label} ({count})
              </option>
            ))}
          </select>
        </label>
      )}
    </section>
  );
}
