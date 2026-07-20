"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, MessageCircle, Inbox, AlertCircle } from "lucide-react";
import AppHeader from "@/components/header";
import ConversationList from "@/components/chat/conversation-list";
import ChatWindow from "@/components/chat/chat-window";
import NewConversationDialog from "@/components/chat/new-conversation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/search-input";
import PlatformFilter from "@/components/ui/platform-filter";
import { useChatStore } from "@/stores/apis/chat/chat.store";
import { useCustomersStore } from "@/stores/apis/customers/customers.store";
import {
  IConversation,
  IConversationFilters,
} from "@/utils/interfaces/chat/chat.interface";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";
import { fmt } from "@/utils/functions/i18n";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  // useSearchParams() (for the ?c= deep link) requires a Suspense boundary.
  return (
    <Suspense>
      <ChatInbox />
    </Suspense>
  );
}

function ChatInbox() {
  // ── Translations ───────────────────────────────────────────────────────────
  const t = useT("chat");
  const tCommon = useT("common");

  // ── All States ─────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [needsMeOnly, setNeedsMeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<PlatformId | "">("");

  // Deep link from an order's "View chat": open that thread on arrival.
  const deepLinkId = useSearchParams().get("c");

  // ── API Integration ────────────────────────────────────────────────────────
  const {
    conversations,
    activeConversation,
    conversationsLoading,
    conversationsTotal,
    loadMoreConversations,
    messagesLoading,
    olderLoading,
    loadOlderMessages,
    fetchConversations,
    createConversation,
    setActiveConversation,
    fetchConversationDetail,
    updateConversationStatus,
    setAiEnabled,
    markSeen,
    sendMessage,
    error,
  } = useChatStore();

  const { customers, fetchAllCustomers } = useCustomersStore();

  // ── Effects ────────────────────────────────────────────────────────────────
  // Built from the three primitives rather than held in state, so the initial
  // fetch and "load older" can never disagree about what the list is showing.
  // Memoised because it feeds an effect: a fresh object literal each render
  // would refetch the inbox on every unrelated re-render.
  const filters: IConversationFilters = useMemo(
    () => ({
      ...(needsMeOnly ? { needs_me: true } : {}),
      ...(platform ? { platform } : {}),
      ...(search ? { search } : {}),
    }),
    [needsMeOnly, platform, search]
  );

  useEffect(() => {
    fetchConversations(filters);
  }, [fetchConversations, filters]);

  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Open the deep-linked thread once it has loaded. A ref (not state) guards
  // it so it fires a single time and never yanks the seller back after they
  // click away — and so flipping the guard doesn't trigger a re-render.
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current || !deepLinkId) return;
    const target = conversations.find((c) => c.id === deepLinkId);
    if (target) {
      deepLinkHandled.current = true;
      handleSelectConversation(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkId, conversations]);

  // ── Methods ────────────────────────────────────────────────────────────────
  function handleSelectConversation(conversation: IConversation) {
    setActiveConversation(conversation);
    fetchConversationDetail(conversation.id);
    // Opening it IS reading it — clear the flags so the list stays meaningful.
    if (conversation.unread || conversation.needs_attention) {
      markSeen(conversation.id);
    }
  }

  async function handleCreateConversation(
    customerId: string,
    platform: PlatformId,
  ) {
    const conv = await createConversation(customerId, platform);
    if (conv) {
      setActiveConversation(conv);
      fetchConversationDetail(conv.id);
    }
  }

  async function handleSend(content: string) {
    if (!activeConversation) return false;
    return sendMessage(activeConversation.id, content);
  }

  async function handleAiEnabledChange(enabled: boolean) {
    if (!activeConversation) return;
    await setAiEnabled(activeConversation.id, enabled);
  }

  async function handleStatusChange(status: "open" | "closed" | "pending") {
    if (!activeConversation) return;
    await updateConversationStatus(activeConversation.id, status);
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  return (
    <>
      <AppHeader title={t.title} />

      <main className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: conversation list */}
        <div className="flex w-72 shrink-0 flex-col border-r">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">
              {t.conversations}
              {conversations.length > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({conversations.length})
                </span>
              )}
            </p>
            <div className="flex items-center gap-0.5">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-pressed={needsMeOnly}
                onClick={() => setNeedsMeOnly((v) => !v)}
                title={needsMeOnly ? t.showAll : t.needsYouOnly}
                aria-label={needsMeOnly ? t.showAll : t.needsYouOnly}
                className={cn(needsMeOnly && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300")}
              >
                {needsMeOnly ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Inbox className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setDialogOpen(true)}
                title={t.newConversation}
                aria-label={t.newConversation}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters. Kept above the list so the seller can narrow a long
              inbox without scrolling it first. */}
          <div className="space-y-2 border-b px-3 py-2.5">
            <SearchInput
              onSearch={setSearch}
              placeholder={t.searchPlaceholder}
              clearLabel={tCommon.clearSearch}
            />
            <PlatformFilter
              value={platform}
              onChange={setPlatform}
              allLabel={tCommon.allPlatforms}
            />
          </div>

          {conversationsLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <ConversationList
                conversations={conversations}
                customers={customers}
                activeId={activeConversation?.id}
                onSelect={handleSelectConversation}
              />

              {/* An inbox appends rather than paging: threads are sorted by
                  recency, and paging away from the thread just replied to
                  would lose the seller's place. */}
              {conversations.length < conversationsTotal && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  disabled={conversationsLoading}
                  onClick={() => loadMoreConversations(filters)}
                >
                  {fmt(tCommon.pagination.loadMore, {
                    shown: conversations.length,
                    total: conversationsTotal,
                  })}
                </Button>
              )}
            </>
          )}
        </div>

        {/* ── Main: chat window */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              customer={customers.find((c) => c.id === activeConversation.customer_id)}
              loading={messagesLoading}
              onSend={handleSend}
              onStatusChange={handleStatusChange}
              onAiEnabledChange={handleAiEnabledChange}
              onLoadOlder={() => loadOlderMessages(activeConversation.id)}
              loadingOlder={olderLoading}
              sendError={error}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <p className="text-sm">{t.selectPrompt}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t.newConversation}
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
