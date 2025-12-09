import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const printableId = parseInt(String(form.get("printable_id") ?? ""), 10);
    const qty = Math.max(1, parseInt(String(form.get("qty") ?? "1"), 10) || 1);
    const color = String(form.get("color") ?? "");
    if (!Number.isFinite(printableId)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "printable_id required" } },
        { status: 400 }
      );
    }

    const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
    const res = await fetch(`${base}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ printable_id: printableId, qty, color }] }),
    });
    const data: unknown = await res.json().catch(() => ({}));
    const orderId = (data as { order_id?: number } | null)?.order_id;
    if (res.ok && orderId) {
      return NextResponse.redirect(new URL(`/order/${orderId}`, req.url), 303);
    }
    return NextResponse.json(
      (data as object) ?? { error: { code: "UNKNOWN" } },
      { status: res.status || 500 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: { code: "INTERNAL", message: (e as Error)?.message || "error" },
      },
      { status: 500 }
    );
  }
}
