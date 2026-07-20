import { IConversationDetail } from "@/utils/interfaces/chat/chat.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface IChatWindowProps {
  conversation: IConversationDetail;
  customer: ICustomer | undefined;
  loading: boolean;
  /** Sends the seller's own reply; resolves false if delivery failed. */
  onSend: (content: string) => Promise<boolean>;
  onStatusChange: (status: "open" | "closed" | "pending") => void | Promise<void>;
  onAiEnabledChange: (enabled: boolean) => void | Promise<void>;
  /** Pages further back into the thread; the detail load only returns the end. */
  onLoadOlder: () => void | Promise<void>;
  loadingOlder?: boolean;
  /** Set when the last send failed, so the seller knows it didn't arrive. */
  sendError?: string | null;
}
