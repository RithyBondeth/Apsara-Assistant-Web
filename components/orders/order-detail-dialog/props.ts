import {
  ICheckout,
  IOrder,
  IReceipt,
  TOrderStatus,
} from "@/utils/interfaces/order/order.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IOrderDetailDialogProps {
  order: IOrder | null;
  customer: ICustomer | undefined;
  products: IProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: TOrderStatus) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  /** Opens a Stripe payment page for this order. Resolves to its link, or null
   *  if the server refused — most often because Stripe is not connected. */
  onCreateCheckout: () => Promise<ICheckout | null>;
  receipts: IReceipt[];
  receiptsLoading: boolean;
  onConfirmReceipt: (receiptId: string) => Promise<boolean>;
  onRejectReceipt: (receiptId: string) => Promise<boolean>;
  error: string | null;
  onDismissError: () => void;
}
