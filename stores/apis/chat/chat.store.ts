import { create } from "zustand";
import api from "@/lib/axios";
import { CHAT_API } from "@/utils/constants/apis/chat.api.constant";
import {
  IConversation,
  IMessage,
} from "@/utils/interfaces/chat/chat.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IChatStore {
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: IConversation) => void;
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<boolean>;
  clearError: () => void;
}

export const useChatStore = create<IChatStore>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IConversation[]>(CHAT_API.CONVERSATIONS);
      set({ conversations: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation, messages: [] });
  },

  fetchMessages: async (conversationId) => {
    set({ messagesLoading: true, error: null });
    try {
      const { data } = await api.get<IMessage[]>(
        CHAT_API.MESSAGES(conversationId)
      );
      set({ messages: data, messagesLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), messagesLoading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const { data } = await api.post<IMessage>(CHAT_API.SEND(conversationId), {
        content,
      });
      set((s) => ({ messages: [...s.messages, data] }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
