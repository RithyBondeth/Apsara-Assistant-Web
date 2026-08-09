import { IOrderCreate } from "@/utils/interfaces/order/order.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface INewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: ICustomer[];
  products: IProduct[];
  /** Pre-selected when the order is started from a conversation. */
  lockedCustomerId?: string;
  conversationId?: string;
  onCreate: (data: IOrderCreate) => Promise<boolean>;
  error: string | null;
  onDismissError: () => void;
}
