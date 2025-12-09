export type ColorOption = {
  value: string;
  label: string;
  hex: string;
};

export const AVAILABLE_COLORS: ColorOption[] = [
  { value: "red", label: "Red", hex: "#e53e3e" },
  { value: "green", label: "Green", hex: "#38a169" },
  { value: "blue", label: "Blue", hex: "#3182ce" },
  { value: "yellow", label: "Yellow", hex: "#ecc94b" },
  { value: "purple", label: "Purple", hex: "#805ad5" },
  { value: "orange", label: "Orange", hex: "#dd6b20" },
  { value: "pink", label: "Pink", hex: "#d53f8c" },
  { value: "cyan", label: "Cyan", hex: "#00b5d8" },
  { value: "gray", label: "Gray", hex: "#718096" },
];

const colorMap: Record<string, number> = Object.fromEntries(
  AVAILABLE_COLORS.map((c) => [c.value, parseInt(c.hex.slice(1), 16)])
);
colorMap["grey"] = colorMap["gray"];

const cssMap: Record<string, string> = Object.fromEntries(
  AVAILABLE_COLORS.map((c) => {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    return [c.value, `rgb(${r}, ${g}, ${b})`];
  })
);
cssMap["grey"] = cssMap["gray"];

const DEFAULT_COLOR = 0x718096;
const DEFAULT_CSS = "rgb(113, 128, 150)";

export function getColorHex(colorName?: string): number {
  if (!colorName) return DEFAULT_COLOR;
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] ?? DEFAULT_COLOR;
}

export function getColorCss(colorName?: string): string {
  if (!colorName) return DEFAULT_CSS;
  const normalized = colorName.toLowerCase().trim();
  return cssMap[normalized] ?? DEFAULT_CSS;
}





