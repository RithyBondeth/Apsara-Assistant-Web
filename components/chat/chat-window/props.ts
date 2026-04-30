import { IConversation, IMessage } from "@/utils/interfaces/chat/chat.interface";

export interface IChatWindowProps {
  conversation: IConversation;
  messages: IMessage[];
  loading: boolean;
  onSend: (content: string) => void | Promise<void>;
}
