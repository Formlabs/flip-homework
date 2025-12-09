import { Printable } from "@/types/printable";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getPrintables(): Promise<Printable[]> {
  const res = await fetch(`${API_BASE}/api/printables`, { 
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error(
      `Failed to fetch printables: ${res.status} ${res.statusText}`
    );
  }
  
  const data = await res.json();
  
  if (!data.printables || !Array.isArray(data.printables)) {
    throw new Error("Invalid response format: missing printables array");
  }
  
  return data.printables;
}

export async function getPrintable(id: string): Promise<Printable> {
  const res = await fetch(`${API_BASE}/api/printables/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Printable with ID ${id} not found`);
    }
    throw new Error(
      `Failed to fetch printable: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data;
}

