export type ColorOption = { name: string; hex: string };

// Canonical palette — names mirror the backend ALLOWED_COLORS set
// (printer-api/.../core/views.py); hex is the single source of truth for
// rendering (3D material + swatch background).
export const COLOR_OPTIONS: ColorOption[] = [
  { name: "red", hex: "#ef4444" },
  { name: "green", hex: "#22c55e" },
  { name: "blue", hex: "#3b82f6" },
  { name: "orange", hex: "#f97316" },
  { name: "purple", hex: "#a855f7" },
  { name: "black", hex: "#222222" },
  { name: "white", hex: "#ffffff" },
  { name: "gray", hex: "#9ca3af" },
];

export const COLOR_NAMES: string[] = COLOR_OPTIONS.map((c) => c.name);

const BY_NAME = new Map(COLOR_OPTIONS.map((c) => [c.name, c.hex]));

// Neutral fallback when a color is missing or outside the palette.
export const FALLBACK_HEX = "#cbd5e1";

export function resolveColor(name: string | null | undefined): string {
  if (!name) return FALLBACK_HEX;
  return BY_NAME.get(name) ?? FALLBACK_HEX;
}
