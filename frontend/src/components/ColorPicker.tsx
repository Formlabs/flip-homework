"use client";

import { AVAILABLE_COLORS } from "@/lib/colors";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({
  selectedColor,
  onColorChange,
  disabled = false,
}: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onColorChange(color.value)}
          disabled={disabled}
          title={color.label}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedColor === color.value
              ? "border-white ring-2 ring-white/30 scale-110"
              : "border-zinc-600 hover:border-zinc-400"
          }`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}

