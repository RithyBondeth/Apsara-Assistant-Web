import { IConversation } from "@/utils/interfaces/chat/chat.interface";

export interface IConversationListProps {
  conversations: IConversation[];
  activeId?: number;
  onSelect: (conversation: IConversation) => void;
}
