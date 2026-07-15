import { IConversationDetail } from "@/utils/interfaces/chat/chat.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface IChatWindowProps {
  conversation: IConversationDetail;
  customer: ICustomer | undefined;
  loading: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStatusChange: (status: "open" | "closed" | "pending") => void | Promise<void>;
}
