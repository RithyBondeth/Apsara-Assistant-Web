export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: string; // Decimal comes as string from FastAPI
  subtotal: string;
}

export interface IOrder {
  id: string;
  user_id: string;
  customer_id: string;
  conversation_id: string | null;
  status: OrderStatus;
  total_amount: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: IOrderItem[];
}

export interface IOrderItemCreate {
  product_id: string;
  quantity: number;
  // unit_price is deliberately absent — the server prices every line from the
  // product's current price. Sending it would be ignored.
}

export interface IOrderCreate {
  customer_id: string;
  conversation_id?: string;
  delivery_address?: string;
  notes?: string;
  items: IOrderItemCreate[];
}

export interface IOrderUpdate {
  status?: OrderStatus;
  delivery_address?: string;
  notes?: string;
}

export interface IOrderFilters {
  status?: OrderStatus;
  customer_id?: string;
  conversation_id?: string;
  /** Matches the customer's name or phone, or the delivery address. */
  search?: string;
}
