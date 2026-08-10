export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Tracked apart from the order status: an order can be paid but not shipped,
 *  or delivered and still unpaid on a cash sale. */
export type TPaymentStatus = "unpaid" | "pending" | "paid";

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
  status: TOrderStatus;
  total_amount: string;
  /** Snapshot taken when the order was placed, not the shop's current setting. */
  currency: string;
  delivery_address: string | null;
  notes: string | null;
  payment_status: TPaymentStatus;
  created_at: string;
  updated_at: string;
  items: IOrderItem[];
}

// unit_price is deliberately absent: the server prices every line from the
// product record, so a client-supplied price would be ignored.
export interface IOrderItemCreate {
  product_id: string;
  quantity: number;
}

export interface IOrderCreate {
  customer_id: string;
  conversation_id?: string | null;
  delivery_address?: string;
  notes?: string;
  items: IOrderItemCreate[];
}

export interface IOrderUpdate {
  status?: TOrderStatus;
  delivery_address?: string;
  notes?: string;
}

/** A hosted Stripe payment page for one order. */
export interface ICheckout {
  checkout_url: string;
  session_id: string;
  payment_status: TPaymentStatus;
}
