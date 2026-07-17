import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IOrderFormProps {
  customers: ICustomer[];
  products: IProduct[];
  onSubmit: (data: OrderFormValues) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  /**
   * When the order is being raised from a conversation, the customer is fixed
   * (it's whoever the seller is chatting with) — prefilled and locked so they
   * can't accidentally bill someone else.
   */
  lockedCustomerId?: string;
}

export interface OrderFormValues {
  customer_id: string;
  delivery_address?: string;
  notes?: string;
  items: { product_id: string; quantity: number }[];
}
