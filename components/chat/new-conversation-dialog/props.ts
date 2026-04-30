import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface INewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: ICustomer[];
  onCreate: (customerId: string, platform: string) => void | Promise<void>;
}
