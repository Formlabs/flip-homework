export async function saveSubscription(subscription: PushSubscription) {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";
  const res = await fetch(`${base}/api/push/subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  });
  if (!res.ok) {
    throw new Error(`Failed to save subscription: ${res.statusText}`);
  }
  return res.json();
}
