import { PRESETS } from "../filters";
import type { AgePreset, Filters, SortKey } from "../types";

const AGES: { id: AgePreset; label: string }[] = [
  { id: "1h", label: "1h" },
  { id: "6h", label: "6h" },
  { id: "24h", label: "24h" },
  { id: "any", label: "All" },
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "volume", label: "Volume" },
  { id: "marketCap", label: "Mkt cap" },
];

const VOL_CHIPS = [
  { label: "Any", value: 0 },
  { label: "Has vol", value: 1 },
  { label: "$500", value: 500 },
  { label: "$1k", value: 1_000 },
  { label: "$5k", value: 5_000 },
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
    const hi = Math.max(lo, max);
    patch({ mcapMin: lo, mcapMax: hi });
  };

  return (
    <section className="controls" aria-label="Combined filters">
      <div className="presets" role="group" aria-label="Presets">
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
              className={active ? "chip chip-on" : "chip"}
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

      <div className="control-grid">
        <fieldset className="field">
          <legend>Market cap</legend>
          <div className="pair">
            <label>
              <span>Min</span>
              <input
                inputMode="numeric"
                value={filters.mcapMin}
                onChange={(e) => setMcap(parseAmount(e.target.value), filters.mcapMax)}
              />
            </label>
            <span className="pair-join">to</span>
            <label>
              <span>Max</span>
              <input
                inputMode="numeric"
                value={filters.mcapMax}
                onChange={(e) => setMcap(filters.mcapMin, parseAmount(e.target.value))}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>24h volume</legend>
          <label className="solo">
            <span>Min</span>
            <input
              inputMode="numeric"
              value={filters.volMin}
              onChange={(e) => patch({ volMin: parseAmount(e.target.value) })}
            />
          </label>
          <div className="chips">
            {VOL_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={filters.volMin === chip.value ? "chip chip-on" : "chip"}
                onClick={() => patch({ volMin: chip.value })}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Newest</legend>
          <div className="chips">
            {AGES.map((age) => (
              <button
                key={age.id}
                type="button"
                className={filters.age === age.id ? "chip chip-on" : "chip"}
                onClick={() => patch({ age: age.id })}
              >
                {age.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Sort matches</legend>
          <div className="chips">
            {SORTS.map((sort) => (
              <button
                key={sort.id}
                type="button"
                className={filters.sort === sort.id ? "chip chip-on" : "chip"}
                onClick={() => patch({ sort: sort.id })}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {categories.length > 0 && (
        <div className="pairs" role="group" aria-label="Paired with">
          <button
            type="button"
            className={!filters.category ? "chip chip-on" : "chip"}
            onClick={() => patch({ category: null })}
          >
            All pairs
          </button>
          {categories.map(([label, count]) => (
            <button
              key={label}
              type="button"
              className={filters.category === label ? "chip chip-on" : "chip"}
              onClick={() => patch({ category: label })}
            >
              {label}
              <em>{count}</em>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
