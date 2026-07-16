import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

export interface INewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: ICustomer[];
  onCreate: (customerId: string, platform: PlatformId) => void | Promise<void>;
}
