"use client";

import { COLOR_OPTIONS } from "@/lib/colors";

type Props = {
  value: string;
  onChange: (name: string) => void;
};

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Color">
      {COLOR_OPTIONS.map((c) => {
        const selected = c.name === value;
        return (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.name)}
            className={`h-7 w-7 rounded-full border transition ${
              selected
                ? "border-white ring-2 ring-cyan-300/70"
                : "border-zinc-600/60 hover:border-zinc-400"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
    </div>
  );
}
