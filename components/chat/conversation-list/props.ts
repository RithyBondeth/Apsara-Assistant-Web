import { IConversation } from "@/utils/interfaces/chat/chat.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface IConversationListProps {
  conversations: IConversation[];
  customers: ICustomer[];
  activeId?: string;
  onSelect: (conversation: IConversation) => void;
}
