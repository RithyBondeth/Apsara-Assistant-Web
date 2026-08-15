import { create } from "zustand";
import api from "@/lib/axios";
import { CONVERSATIONS_API, CHAT_API } from "@/utils/constants/apis/conversations.api.constant";
import {
  IConversation,
  IConversationDetail,
  IChatResponse,
  IMessage,
  IConversationNote,
  IConversationTag,
  IInboxFilters,
  IInboxMetrics,
} from "@/utils/interfaces/chat/chat.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { fetchAllPages } from "@/utils/functions/pagination";

interface IChatStore {
  // ── Conversations
  conversations: IConversation[];
  activeConversation: IConversationDetail | null;
  conversationsLoading: boolean;
  metrics: IInboxMetrics | null;

  // ── Messages
  messagesLoading: boolean;

  // ── Errors
  error: string | null;

  // ── Actions
  fetchConversations: (silent?: boolean, filters?: IInboxFilters) => Promise<void>;
  fetchInboxMetrics: () => Promise<void>;
  createConversation: (customerId: string, platform: string) => Promise<IConversation | null>;
  setActiveConversation: (conversation: IConversation | null) => void;
  fetchConversationDetail: (id: string, silent?: boolean) => Promise<void>;
  updateConversationStatus: (id: string, status: "open" | "closed" | "pending") => Promise<boolean>;
  setHandlingMode: (id: string, mode: "auto" | "manual") => Promise<boolean>;
  markRead: (id: string) => Promise<void>;
  addNote: (id: string, content: string) => Promise<boolean>;
  deleteNote: (id: string, noteId: string) => Promise<boolean>;
  addTag: (id: string, name: string) => Promise<boolean>;
  deleteTag: (id: string, tagId: string) => Promise<boolean>;
  sendMessage: (conversationId: string, message: string) => Promise<boolean>;
  sendSellerMessage: (conversationId: string, message: string) => Promise<boolean>;
  clearError: () => void;
}

export const useChatStore = create<IChatStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  conversationsLoading: false,
  metrics: null,
  messagesLoading: false,
  error: null,

  fetchConversations: async (silent = false, filters = {}) => {
    if (!silent) set({ conversationsLoading: true, error: null });
    try {
      if (silent) {
        // Only the newest window can have changed since the last poll. Keep
        // older pages already loaded instead of downloading all history every
        // five seconds.
        const { data: response } = await api.get<IConversation[]>(CONVERSATIONS_API.LIST, {
          params: { skip: 0, limit: 100, ...filters },
        });
        const data = response.map((conversation) => ({
          ...conversation,
          tags: conversation.tags ?? [],
        }));
        set((state) => {
          const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== "");
          if (hasFilters) return { conversations: data, conversationsLoading: false };
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
        const data = await fetchAllPages<IConversation>(CONVERSATIONS_API.LIST, { ...filters });
        set({
          conversations: data.map((conversation) => ({
            ...conversation,
            tags: conversation.tags ?? [],
          })),
          conversationsLoading: false,
        });
      }
    } catch (error) {
      set({ error: extractErrorMessage(error), conversationsLoading: false });
    }
  },

  fetchInboxMetrics: async () => {
    try {
      const { data } = await api.get<IInboxMetrics>(CONVERSATIONS_API.METRICS);
      set({ metrics: data });
    } catch (error) {
      set({ error: extractErrorMessage(error) });
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
    set({
      activeConversation: conversation ? { ...conversation, messages: [], notes: [] } : null,
    });
  },

  fetchConversationDetail: async (id, silent = false) => {
    if (!silent) set({ messagesLoading: true, error: null });
    try {
      const { data } = await api.get<IConversationDetail>(CONVERSATIONS_API.GET(id));
      const normalized = { ...data, tags: data.tags ?? [], notes: data.notes ?? [] };
      set((state) => ({
        activeConversation: state.activeConversation?.id === id ? normalized : state.activeConversation,
        messagesLoading: false,
      }));
      if (data.unread_count > 0) await get().markRead(id);
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

  setHandlingMode: async (id, handling_mode) => {
    set({ error: null });
    try {
      const { data } = await api.patch<IConversation>(CONVERSATIONS_API.UPDATE(id), {
        handling_mode,
      });
      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation.id === id ? data : conversation
        ),
        activeConversation: state.activeConversation?.id === id
          ? { ...state.activeConversation, ...data }
          : state.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  markRead: async (id) => {
    try {
      const { data } = await api.post<IConversation>(CONVERSATIONS_API.MARK_READ(id));
      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation.id === id ? { ...conversation, ...data } : conversation
        ),
        activeConversation: state.activeConversation?.id === id
          ? { ...state.activeConversation, ...data }
          : state.activeConversation,
      }));
    } catch (error) {
      set({ error: extractErrorMessage(error) });
    }
  },

  addNote: async (id, content) => {
    set({ error: null });
    try {
      const { data } = await api.post<IConversationNote>(CONVERSATIONS_API.NOTES(id), {
        content,
      });
      set((state) => ({
        activeConversation: state.activeConversation?.id === id
          ? { ...state.activeConversation, notes: [...state.activeConversation.notes, data] }
          : state.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  deleteNote: async (id, noteId) => {
    set({ error: null });
    try {
      await api.delete(CONVERSATIONS_API.DELETE_NOTE(id, noteId));
      set((state) => ({
        activeConversation: state.activeConversation?.id === id
          ? {
              ...state.activeConversation,
              notes: state.activeConversation.notes.filter((note) => note.id !== noteId),
            }
          : state.activeConversation,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  addTag: async (id, name) => {
    set({ error: null });
    try {
      const { data } = await api.post<IConversationTag>(CONVERSATIONS_API.TAGS(id), { name });
      set((state) => {
        const add = (tags: IConversationTag[]) =>
          tags.some((tag) => tag.id === data.id) ? tags : [...tags, data];
        return {
          conversations: state.conversations.map((conversation) =>
            conversation.id === id ? { ...conversation, tags: add(conversation.tags ?? []) } : conversation
          ),
          activeConversation: state.activeConversation?.id === id
            ? { ...state.activeConversation, tags: add(state.activeConversation.tags ?? []) }
            : state.activeConversation,
        };
      });
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  deleteTag: async (id, tagId) => {
    set({ error: null });
    try {
      await api.delete(CONVERSATIONS_API.DELETE_TAG(id, tagId));
      set((state) => {
        const remove = (tags: IConversationTag[]) => tags.filter((tag) => tag.id !== tagId);
        return {
          conversations: state.conversations.map((conversation) =>
            conversation.id === id ? { ...conversation, tags: remove(conversation.tags ?? []) } : conversation
          ),
          activeConversation: state.activeConversation?.id === id
            ? { ...state.activeConversation, tags: remove(state.activeConversation.tags ?? []) }
            : state.activeConversation,
        };
      });
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
