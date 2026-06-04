"use client";

import { useState } from "react";
import StlViewer from "@/components/StlViewer";
import ColorPicker from "@/components/ColorPicker";
import { resolveColor, COLOR_NAMES } from "@/lib/colors";

type Props = {
  printableId: number;
  stlUrl?: string | null;
  initialColor?: string;
};

export default function PrintablePanel({
  printableId,
  stlUrl,
  initialColor,
}: Props) {
  const defaultColor =
    initialColor && COLOR_NAMES.includes(initialColor) ? initialColor : "gray";
  const [color, setColor] = useState<string>(defaultColor);

  return (
    <div>
      {stlUrl ? (
        <div className="mt-4 rounded overflow-hidden">
          <StlViewer url={stlUrl} color={resolveColor(color)} height={420} />
        </div>
      ) : null}
      <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-300/90">Color</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <form
          action="/api/orders"
          method="post"
          className="flex items-center gap-3"
        >
          <label className="text-sm" htmlFor="qty">
            Qty
          </label>
          <input
            id="qty"
            name="qty"
            type="number"
            min={1}
            defaultValue={1}
            className="border border-zinc-700/60 rounded px-2 py-1 w-20 bg-transparent text-zinc-100"
          />
          <input type="hidden" name="printable_id" value={printableId} />
          <input type="hidden" name="color" value={color} />
          <button type="submit" className="btn-neon">
            Order
          </button>
        </form>
      </div>
    </div>
  );
}
