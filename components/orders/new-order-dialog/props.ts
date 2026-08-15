import { IOrderCreate, IOrderDraft } from "@/utils/interfaces/order/order.interface";
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
  /** A schema-validated AI proposal. The seller still edits and submits it. */
  initialDraft?: IOrderDraft | null;
  onCreate: (data: IOrderCreate) => Promise<boolean>;
  error: string | null;
  onDismissError: () => void;
}
