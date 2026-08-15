import { create } from "zustand";
import api from "@/lib/axios";
import { CONVERSATIONS_API, CHAT_API } from "@/utils/constants/apis/conversations.api.constant";
import {
  IConversation,
  IConversationDetail,
  IChatResponse,
  IMessage,
} from "@/utils/interfaces/chat/chat.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { fetchAllPages } from "@/utils/functions/pagination";

interface IChatStore {
  // ── Conversations
  conversations: IConversation[];
  activeConversation: IConversationDetail | null;
  conversationsLoading: boolean;

  // ── Messages
  messagesLoading: boolean;

  // ── Errors
  error: string | null;

  // ── Actions
  fetchConversations: (silent?: boolean) => Promise<void>;
  createConversation: (customerId: string, platform: string) => Promise<IConversation | null>;
  setActiveConversation: (conversation: IConversation) => void;
  fetchConversationDetail: (id: string, silent?: boolean) => Promise<void>;
  updateConversationStatus: (id: string, status: "open" | "closed" | "pending") => Promise<boolean>;
  sendMessage: (conversationId: string, message: string) => Promise<boolean>;
  sendSellerMessage: (conversationId: string, message: string) => Promise<boolean>;
  clearError: () => void;
}

export const useChatStore = create<IChatStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  conversationsLoading: false,
  messagesLoading: false,
  error: null,

  fetchConversations: async (silent = false) => {
    if (!silent) set({ conversationsLoading: true, error: null });
    try {
      if (silent) {
        // Only the newest window can have changed since the last poll. Keep
        // older pages already loaded instead of downloading all history every
        // five seconds.
        const { data } = await api.get<IConversation[]>(CONVERSATIONS_API.LIST, {
          params: { skip: 0, limit: 100 },
        });
        set((state) => {
          const recentIds = new Set(data.map((conversation) => conversation.id));
          return {
            conversations: [
              ...data,
              ...state.conversations.filter((conversation) => !recentIds.has(conversation.id)),
            ],
            conversationsLoading: false,
          };
        });
      } else {
        const data = await fetchAllPages<IConversation>(CONVERSATIONS_API.LIST);
        set({ conversations: data, conversationsLoading: false });
      }
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

  fetchConversationDetail: async (id, silent = false) => {
    if (!silent) set({ messagesLoading: true, error: null });
    try {
      const { data } = await api.get<IConversationDetail>(CONVERSATIONS_API.GET(id));
      set((state) => ({
        activeConversation: state.activeConversation?.id === id ? data : state.activeConversation,
        messagesLoading: false,
      }));
    } catch (error) {
      set({ error: extractErrorMessage(error), messagesLoading: false });
    }
  },

  updateConversationStatus: async (id, status) => {
    set({ error: null });
    try {
      const { data } = await api.patch<IConversation>(CONVERSATIONS_API.UPDATE(id), { status });
      // Update in the list
      set((s) => ({
        conversations: s.conversations.map((c) => (c.id === id ? data : c)),
        activeConversation: s.activeConversation?.id === id
          ? { ...s.activeConversation, ...data }
          : s.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  // ── Uses the AI chat endpoint — returns customer + AI messages
  sendMessage: async (conversationId, message) => {
    set({ error: null });
    try {
      const { data } = await api.post<IChatResponse>(CHAT_API.SEND(conversationId), {
        message,
        message_type: "text",
      });
      set((s) => ({
        activeConversation: s.activeConversation
          ? {
              ...s.activeConversation,
              messages: [
                ...s.activeConversation.messages,
                data.customer_message,
                data.ai_message,
                ...(data.qr_message ? [data.qr_message] : []),
              ],
            }
          : s.activeConversation,
      }));
      return true;
    } catch (error) {
      // The backend stores the customer's message before it calls the model, so
      // a failed reply still changed the thread — resync rather than leave the
      // sent message missing from the view until the next visit. The refetch
      // clears `error` on entry, so set ours after it settles.
      const message = extractErrorMessage(error);
      await get().fetchConversationDetail(conversationId);
      set({ error: message });
      return false;
    }
  },

  sendSellerMessage: async (conversationId, content) => {
    set({ error: null });
    try {
      const { data } = await api.post<IMessage>(
        CONVERSATIONS_API.SEND_MESSAGE(conversationId),
        { content, message_type: "text" },
      );
      set((state) => ({
        activeConversation: state.activeConversation?.id === conversationId
          ? {
              ...state.activeConversation,
              messages: [...state.activeConversation.messages, data],
            }
          : state.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
