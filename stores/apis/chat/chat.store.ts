import { create } from "zustand";
import api from "@/lib/axios";
import { CONVERSATIONS_API } from "@/utils/constants/apis/conversations.api.constant";
import {
  IConversationFilters,
  IConversation,
  IConversationDetail,
  IMessage,
} from "@/utils/interfaces/chat/chat.interface";
import { IPage } from "@/utils/interfaces/common/page.interface";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { fetchEveryPage } from "@/utils/functions/fetch-all";
import { useDashboardStore } from "@/stores/apis/dashboard/dashboard.store";

export const CONVERSATIONS_PAGE_SIZE = 25;
/** How many older messages one "load older" click pulls in. */
export const MESSAGES_PAGE_SIZE = 30;

interface IChatStore {
  /* ---------------------------------- States --------------------------------- */
  conversations: IConversation[];
  /** How many threads match the current filter, across all pages. */
  conversationsTotal: number;
  /** How many pages are currently loaded into `conversations`. */
  conversationsPage: number;
  activeConversation: IConversationDetail | null;
  conversationsLoading: boolean;

  // ── Messages ───────────────────────────────────────────────────────────────
  messagesLoading: boolean;
  /** Separate from `messagesLoading` so paging back doesn't blank the thread. */
  olderLoading: boolean;

  /* ---------------------------------- Errors --------------------------------- */
  error: string | null;

  /* ---------------------------------- Actions --------------------------------- */
  fetchConversations: (filters?: IConversationFilters) => Promise<void>;
  loadMoreConversations: (filters?: IConversationFilters) => Promise<void>;
  fetchAllConversations: (filters?: IConversationFilters) => Promise<void>;
  createConversation: (
    customerId: string,
    platform: PlatformId,
  ) => Promise<IConversation | null>;
  setActiveConversation: (conversation: IConversation) => void;
  fetchConversationDetail: (id: string) => Promise<void>;
  loadOlderMessages: (id: string) => Promise<void>;
  updateConversationStatus: (
    id: string,
    status: "open" | "closed" | "pending",
  ) => Promise<boolean>;
  sendMessage: (conversationId: string, message: string) => Promise<boolean>;
  setAiEnabled: (id: string, enabled: boolean) => Promise<boolean>;
  markSeen: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<IChatStore>((set, get) => ({
  conversations: [],
  conversationsTotal: 0,
  conversationsPage: 1,
  activeConversation: null,
  conversationsLoading: false,
  messagesLoading: false,
  olderLoading: false,
  error: null,

  fetchConversations: async (filters) => {
    set({ conversationsLoading: true, error: null });
    try {
      const { data } = await api.get<IPage<IConversation>>(
        CONVERSATIONS_API.LIST,
        { params: { ...filters, skip: 0, limit: CONVERSATIONS_PAGE_SIZE } },
      );
      set({
        conversations: data.items,
        conversationsTotal: data.total,
        conversationsPage: 1,
        conversationsLoading: false,
      });
    } catch (error) {
      set({ error: extractErrorMessage(error), conversationsLoading: false });
    }
  },

  // The inbox appends rather than paging prev/next: threads are sorted by
  // recency, so "older threads below" matches how a seller reads it, and
  // paging away from the thread they just replied to would be jarring.
  loadMoreConversations: async (filters) => {
    const { conversationsPage, conversations } = get();
    set({ conversationsLoading: true, error: null });
    try {
      const { data } = await api.get<IPage<IConversation>>(
        CONVERSATIONS_API.LIST,
        {
          params: {
            ...filters,
            skip: conversationsPage * CONVERSATIONS_PAGE_SIZE,
            limit: CONVERSATIONS_PAGE_SIZE,
          },
        },
      );
      // Filter by id: a thread bumped to page 1 by a new message while the
      // seller was reading would otherwise arrive twice and render duplicate
      // keys.
      const known = new Set(conversations.map((c) => c.id));
      set({
        conversations: [
          ...conversations,
          ...data.items.filter((c) => !known.has(c.id)),
        ],
        conversationsTotal: data.total,
        conversationsPage: conversationsPage + 1,
        conversationsLoading: false,
      });
    } catch (error) {
      set({ error: extractErrorMessage(error), conversationsLoading: false });
    }
  },

  // Analytics counts threads per platform — a partial list yields wrong counts.
  fetchAllConversations: async (filters) => {
    set({ conversationsLoading: true, error: null });
    try {
      const { items, total } = await fetchEveryPage<IConversation>(
        CONVERSATIONS_API.LIST,
        filters ?? {},
      );
      set({
        conversations: items,
        conversationsTotal: total,
        conversationsPage: 1,
        conversationsLoading: false,
      });
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
      set((s) => ({
        conversations: [data, ...s.conversations],
        conversationsTotal: s.conversationsTotal + 1,
      }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return null;
    }
  },

  setActiveConversation: (conversation) => {
    // Optimistically set the header while messages load
    set({
      activeConversation: { ...conversation, messages: [], message_total: 0 },
    });
  },

  // The detail endpoint returns only the newest window of a thread, so paging
  // backwards walks toward the start. Offsets are computed from the CURRENT
  // total each time and ids are deduped, because a message arriving mid-read
  // shifts every offset by one.
  loadOlderMessages: async (id) => {
    const active = get().activeConversation;
    if (!active || active.id !== id) return;

    const remaining = active.message_total - active.messages.length;
    if (remaining <= 0) return;

    set({ olderLoading: true, error: null });
    try {
      const limit = Math.min(MESSAGES_PAGE_SIZE, remaining);
      const { data } = await api.get<IPage<IMessage>>(
        CONVERSATIONS_API.MESSAGES(id),
        { params: { skip: remaining - limit, limit } },
      );
      set((s) => {
        // The seller may have switched threads while this was in flight.
        if (!s.activeConversation || s.activeConversation.id !== id) {
          return { olderLoading: false };
        }
        const seen = new Set(s.activeConversation.messages.map((m) => m.id));
        const older = data.items.filter((m) => !seen.has(m.id));
        return {
          activeConversation: {
            ...s.activeConversation,
            messages: [...older, ...s.activeConversation.messages],
            message_total: data.total,
          },
          olderLoading: false,
        };
      });
    } catch (error) {
      set({ error: extractErrorMessage(error), olderLoading: false });
    }
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
      const { data } = await api.post<IConversation>(
        CONVERSATIONS_API.SEEN(id),
      );
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
