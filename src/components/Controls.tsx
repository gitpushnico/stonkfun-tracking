import { PRESETS } from "../filters";
import type { AgePreset, Filters, SortKey } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    <section className="grid gap-4" aria-label="Filters">
      <div className="grid grid-cols-[1.1fr_0.7fr_1.2fr_1fr] gap-6 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
        <fieldset className="m-0 grid content-start gap-2 border-0 p-0">
          <legend className="mb-0.5 p-0 text-[0.8rem] text-muted-foreground">Market cap</legend>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <label>
              <span className="sr-only">Minimum</span>
              <Input
                inputMode="numeric"
                value={filters.mcapMin}
                onChange={(e) => setMcap(parseAmount(e.target.value), filters.mcapMax)}
              />
            </label>
            <span className="text-muted-foreground">–</span>
            <label>
              <span className="sr-only">Maximum</span>
              <Input
                inputMode="numeric"
                value={filters.mcapMax}
                onChange={(e) => setMcap(filters.mcapMin, parseAmount(e.target.value))}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Quick ranges">
            {PRESETS.map((preset) => {
              const active =
                filters.mcapMin === preset.mcapMin &&
                filters.mcapMax === preset.mcapMax &&
                filters.volMin === preset.volMin &&
                filters.age === preset.age;
              return (
                <Button
                  key={preset.id}
                  type="button"
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
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
                </Button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="m-0 grid content-start gap-2 border-0 p-0">
          <legend className="mb-0.5 p-0 text-[0.8rem] text-muted-foreground">Min. volume (24h)</legend>
          <label>
            <span className="sr-only">Minimum volume</span>
            <Input
              inputMode="numeric"
              value={filters.volMin}
              onChange={(e) => patch({ volMin: parseAmount(e.target.value) })}
            />
          </label>
        </fieldset>

        <fieldset className="m-0 grid content-start gap-2 border-0 p-0">
          <legend className="mb-0.5 p-0 text-[0.8rem] text-muted-foreground">Age</legend>
          <ToggleGroup
            value={[filters.age]}
            onValueChange={(next) => {
              const age = Array.isArray(next) ? next[0] : next;
              if (age) patch({ age: age as AgePreset });
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            {AGES.map((age) => (
              <ToggleGroupItem key={age.id} value={age.id}>
                {age.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>

        <fieldset className="m-0 grid content-start gap-2 border-0 p-0">
          <legend className="mb-0.5 p-0 text-[0.8rem] text-muted-foreground">Sort</legend>
          <ToggleGroup
            value={[filters.sort]}
            onValueChange={(next) => {
              const sort = Array.isArray(next) ? next[0] : next;
              if (sort) patch({ sort: sort as SortKey });
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            {SORTS.map((sort) => (
              <ToggleGroupItem key={sort.id} value={sort.id}>
                {sort.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>
      </div>

      {categories.length > 0 && (
        <label className="flex max-w-[280px] items-baseline gap-3 text-[0.9rem] text-muted-foreground">
          <span>Pair</span>
          <Select
            value={filters.category ?? "all"}
            onValueChange={(value) => patch({ category: !value || value === "all" ? null : value })}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue>{(value) => (value === "all" || value == null ? "All" : String(value))}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="all">All</SelectItem>
              {categories.map(([label, count]) => (
                <SelectItem key={label} value={label}>
                  {label} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
    </section>
  );
}
