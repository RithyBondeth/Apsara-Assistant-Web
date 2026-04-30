"use client";

import { useEffect } from "react";
import AppHeader from "@/components/header";
import ConversationList from "@/components/chat/conversation-list";
import ChatWindow from "@/components/chat/chat-window";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { IConversation } from "@/utils/interfaces/chat/chat.interface";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  // ── API Integration
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    messagesLoading,
    fetchConversations,
    setActiveConversation,
    fetchMessages,
    sendMessage,
  } = useChatStore();

  // ── Effects
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Methods
  function handleSelectConversation(conversation: IConversation) {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
  }

  async function handleSend(content: string) {
    if (!activeConversation) return;
    await sendMessage(activeConversation.id, content);
  }

  // ── Render UI
  return (
    <>
      <AppHeader title="Chat" />

      <main className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: conversation list */}
        <div className="flex w-72 shrink-0 flex-col border-r">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">
              Conversations
              {conversations.length > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({conversations.length})
                </span>
              )}
            </p>
          </div>

          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
            />
          )}
        </div>

        {/* ── Main: chat window */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              loading={messagesLoading}
              onSend={handleSend}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
