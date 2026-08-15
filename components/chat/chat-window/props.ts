import { IConversationDetail } from "@/utils/interfaces/chat/chat.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface IChatWindowProps {
  conversation: IConversationDetail;
  customer: ICustomer | undefined;
  loading: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStatusChange: (status: "open" | "closed" | "pending") => void | Promise<void>;
  /** Turn this conversation into an order — the assistant collects the
   *  details but cannot confirm a sale itself. */
  onCreateOrder: () => void;
  onDraftOrder: () => void | Promise<void>;
  draftingOrder: boolean;
  onBack?: () => void;
  /** Connected threads send the seller's text to the real customer; local
   * rehearsals submit a simulated customer turn and show the AI response. */
  isLiveChannel: boolean;
  onToggleDetails?: () => void;
}
