import { create } from "zustand";
import api from "@/lib/axios";
import {
  CONVERSATIONS_API,
  CHAT_API,
} from "@/utils/constants/apis/conversations.api.constant";
import {
  IConversation,
  IConversationDetail,
  IChatResponse,
} from "@/utils/interfaces/chat/chat.interface";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IChatStore {
  /* ---------------------------------- States --------------------------------- */
  conversations: IConversation[];
  activeConversation: IConversationDetail | null;
  conversationsLoading: boolean;

  // ── Messages ───────────────────────────────────────────────────────────────
  messagesLoading: boolean;

  /* ---------------------------------- Errors --------------------------------- */
  error: string | null;

  /* ---------------------------------- Actions --------------------------------- */
  fetchConversations: () => Promise<void>;
  createConversation: (
    customerId: string,
    platform: PlatformId,
  ) => Promise<IConversation | null>;
  setActiveConversation: (conversation: IConversation) => void;
  fetchConversationDetail: (id: string) => Promise<void>;
  updateConversationStatus: (
    id: string,
    status: "open" | "closed" | "pending",
  ) => Promise<boolean>;
  sendMessage: (conversationId: string, message: string) => Promise<boolean>;
  clearError: () => void;
}

export const useChatStore = create<IChatStore>((set) => ({
  conversations: [],
  activeConversation: null,
  conversationsLoading: false,
  messagesLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ conversationsLoading: true, error: null });
    try {
      const { data } = await api.get<IConversation[]>(CONVERSATIONS_API.LIST);
      set({ conversations: data, conversationsLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), conversationsLoading: false });
    }
  },

  createConversation: async (customerId, platform) => {
    set({ error: null });
    try {
      const { data } = await api.post<IConversation>(CONVERSATIONS_API.CREATE, {
        customer_id: customerId,
        platform,
      });
      set((s) => ({ conversations: [data, ...s.conversations] }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return null;
    }
  },

  setActiveConversation: (conversation) => {
    // Optimistically set the header while messages load
    set({ activeConversation: { ...conversation, messages: [] } });
  },

  fetchConversationDetail: async (id) => {
    set({ messagesLoading: true, error: null });
    try {
      const { data } = await api.get<IConversationDetail>(
        CONVERSATIONS_API.GET(id),
      );
      set({ activeConversation: data, messagesLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), messagesLoading: false });
    }
  },

  updateConversationStatus: async (id, status) => {
    set({ error: null });
    try {
      const { data } = await api.patch<IConversation>(
        CONVERSATIONS_API.UPDATE(id),
        { status },
      );
      // Update in the list
      set((s) => ({
        conversations: s.conversations.map((c) => (c.id === id ? data : c)),
        activeConversation:
          s.activeConversation?.id === id
            ? { ...s.activeConversation, ...data }
            : s.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  /* --------------------------------- Methods --------------------------------- */
  // Uses the AI chat endpoint — returns customer + AI messages
  sendMessage: async (conversationId, message) => {
    set({ error: null });
    try {
      const { data } = await api.post<IChatResponse>(
        CHAT_API.SEND(conversationId),
        {
          message,
          message_type: "text",
        },
      );
      set((s) => ({
        activeConversation: s.activeConversation
          ? {
              ...s.activeConversation,
              messages: [
                ...s.activeConversation.messages,
                data.customer_message,
                data.ai_message,
              ],
            }
          : s.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
