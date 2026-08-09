"use client";

import { useEffect, useState } from "react";
import { Plus, MessageCircle, X } from "lucide-react";
import AppHeader from "@/components/header";
import ConversationList from "@/components/chat/conversation-list";
import ChatWindow from "@/components/chat/chat-window";
import NewConversationDialog from "@/components/chat/new-conversation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import { IConversation } from "@/utils/interfaces/chat/chat.interface";

export default function ChatPage() {
  // ── All States
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── API Integration
  const {
    conversations,
    activeConversation,
    conversationsLoading,
    messagesLoading,
    error,
    clearError,
    fetchConversations,
    createConversation,
    setActiveConversation,
    fetchConversationDetail,
    updateConversationStatus,
    sendMessage,
  } = useChatStore();

  const { customers, fetchCustomers } = useCustomersStore();

  // ── Effects
  useEffect(() => {
    fetchConversations();
    fetchCustomers();
  }, [fetchConversations, fetchCustomers]);

  // ── Methods
  function handleSelectConversation(conversation: IConversation) {
    setActiveConversation(conversation);
    fetchConversationDetail(conversation.id);
  }

  async function handleCreateConversation(customerId: string, platform: string) {
    const conv = await createConversation(customerId, platform);
    if (conv) {
      setActiveConversation(conv);
      fetchConversationDetail(conv.id);
    }
  }

  async function handleSend(content: string) {
    if (!activeConversation) return;
    await sendMessage(activeConversation.id, content);
  }

  async function handleStatusChange(status: "open" | "closed" | "pending") {
    if (!activeConversation) return;
    await updateConversationStatus(activeConversation.id, status);
  }

  // ── Render UI
  return (
    <>
      <AppHeader title="Chat" />

      <main className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: conversation list */}
        <div className="flex w-72 shrink-0 flex-col border-r">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">
              Conversations
              {conversations.length > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({conversations.length})
                </span>
              )}
            </p>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setDialogOpen(true)}
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {conversationsLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              customers={customers}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
            />
          )}
        </div>

        {/* ── Main: chat window */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ── Failure banner: the AI reply can fail on its own, after the
                 customer's message was already saved */}
          {error && (
            <div className="flex items-start gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
              <p className="flex-1">{error}</p>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss"
                className="shrink-0 rounded p-0.5 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              customer={customers.find((c) => c.id === activeConversation.customer_id)}
              loading={messagesLoading}
              onSend={handleSend}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a conversation to start chatting</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New conversation
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* ── New conversation dialog */}
      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customers={customers}
        onCreate={handleCreateConversation}
      />
    </>
  );
}
