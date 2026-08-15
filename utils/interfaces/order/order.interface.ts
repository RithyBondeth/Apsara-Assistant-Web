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
export type TReceiptReviewStatus = "pending" | "accepted" | "rejected";

export interface IReceipt {
  id: string;
  file_url: string | null;
  file_type: string | null;
  file_name: string | null;
  file_size: number | null;
  review_status: TReceiptReviewStatus | null;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
}

export interface IOrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  variant_name: string;
  variant_sku: string | null;
  variant_options: Record<string, string>;
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
  reservation_expires_at: string | null;
  payment_status: TPaymentStatus;
  payment_method: "stripe" | "qr" | null;
  payment_receipt_attachment_id: string | null;
  payment_confirmed_by_user_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  items: IOrderItem[];
}

// unit_price is deliberately absent: the server prices every line from the
// product record, so a client-supplied price would be ignored.
export interface IOrderItemCreate {
  product_id: string;
  variant_id: string;
  quantity: number;
}

export interface IOrderDraftItem {
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  variant_options: Record<string, string>;
  quantity: number;
  unit_price: string;
  subtotal: string;
  stock: number;
}

export interface IOrderDraft {
  customer_id: string;
  conversation_id: string;
  delivery_address: string | null;
  notes: string | null;
  items: IOrderDraftItem[];
  missing_fields: string[];
  warnings: string[];
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
