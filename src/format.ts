export function usd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2).replace(/\.00$/, "")}k`;
  if (value >= 100) return `$${Math.round(value)}`;
  if (value >= 1) return `$${value.toFixed(0)}`;
  if (value > 0) return `$${value.toFixed(2)}`;
  return "$0";
}

export function ageLabel(iso: string, now = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 48) {
    const rem = min % 60;
    return rem ? `${hr}h ${rem}m` : `${hr}h`;
  }
  return `${Math.floor(hr / 24)}d`;
}

export function clock(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
