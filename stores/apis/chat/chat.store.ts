import { create } from "zustand";
import api from "@/lib/axios";
import { CONVERSATIONS_API } from "@/utils/constants/apis/conversations.api.constant";
import {
  IConversation,
  IConversationDetail,
  IMessage,
} from "@/utils/interfaces/chat/chat.interface";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { useDashboardStore } from "@/stores/apis/dashboard/dashboard.store";

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
  fetchConversations: (filters?: { needs_me?: boolean }) => Promise<void>;
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
  setAiEnabled: (id: string, enabled: boolean) => Promise<boolean>;
  markSeen: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<IChatStore>((set) => ({
  conversations: [],
  activeConversation: null,
  conversationsLoading: false,
  messagesLoading: false,
  error: null,

  fetchConversations: async (filters) => {
    set({ conversationsLoading: true, error: null });
    try {
      const { data } = await api.get<IConversation[]>(CONVERSATIONS_API.LIST, {
        params: filters,
      });
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

  // Pause/resume the AI for one conversation. While paused the customer's
  // messages still arrive; the bot just stops answering them.
  setAiEnabled: async (id, enabled) => {
    set({ error: null });
    try {
      const { data } = await api.patch<IConversation>(
        CONVERSATIONS_API.UPDATE(id),
        { ai_enabled: enabled },
      );
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

  // Clears the unread mark and the escalation flag once the seller opens the
  // thread. Fire-and-forget: failing to clear a badge must never block reading.
  markSeen: async (id) => {
    try {
      const { data } = await api.post<IConversation>(CONVERSATIONS_API.SEEN(id));
      set((s) => ({
        conversations: s.conversations.map((c) => (c.id === id ? data : c)),
        activeConversation:
          s.activeConversation?.id === id
            ? { ...s.activeConversation, ...data }
            : s.activeConversation,
      }));
      // The sidebar badge is fed by the dashboard stats, which it only reloads
      // on navigation. Without this it would still read "1 waiting" after the
      // seller just read the thread — and a badge that lies gets ignored.
      useDashboardStore.getState().fetchStats();
    } catch {
      // Intentionally silent — the thread still opens.
    }
  },

  /* --------------------------------- Methods --------------------------------- */
  // The seller's own reply. The API delivers it to the customer on their
  // platform first and only persists it if that succeeded, so a message
  // appearing here means it actually reached them.
  sendMessage: async (conversationId, message) => {
    set({ error: null });
    try {
      const { data } = await api.post<IMessage>(
        CONVERSATIONS_API.SEND_MESSAGE(conversationId),
        { content: message, message_type: "text" },
      );
      set((s) => ({
        activeConversation: s.activeConversation
          ? {
              ...s.activeConversation,
              messages: [...s.activeConversation.messages, data],
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
