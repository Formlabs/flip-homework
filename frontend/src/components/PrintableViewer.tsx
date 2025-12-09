"use client";

import { useState } from "react";
import StlViewer from "./StlViewer";
import { ColorPicker } from "./ColorPicker";

interface PrintableViewerProps {
  stlUrl: string;
  initialColor?: string;
  printableId: number;
}

export function PrintableViewer({ stlUrl, initialColor = "gray", printableId }: PrintableViewerProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor);

  return (
    <div className="space-y-4">
      <div className="rounded overflow-hidden">
        <StlViewer url={stlUrl} height={420} color={selectedColor} />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 block">
            Select Color
          </label>
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>
        
        {selectedColor !== initialColor && (
          <button
            type="button"
            onClick={() => setSelectedColor(initialColor)}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline"
          >
            Reset to original
          </button>
        )}
      </div>

      <div className="flex items-center justify-end pt-2 border-t border-zinc-700/40">
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
          <input type="hidden" name="color" value={selectedColor} />
          <button type="submit" className="btn-neon">
            Order
          </button>
        </form>
      </div>
    </div>
  );
}

