export type OrderItem = {
  printable_id: number;
  name: string;
  color: string;
  stl_url: string | null;
  qty: number;
};

export type OrderStatus = {
  id: number;
  status: string;
  assigned_printer_id?: number | null;
  progress: number;
  items: OrderItem[];
};

export type OrderSummary = {
  id: number;
  status: string;
  assigned_printer_id: number | null;
  progress: number;
  items: OrderItem[];
};
