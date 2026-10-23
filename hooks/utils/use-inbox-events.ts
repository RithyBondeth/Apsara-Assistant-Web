"use client";

import { useEffect, useRef, useState } from "react";
import { API_V1, BASE_URL } from "@/utils/constants/apis/base.api.constant";

export type TInboxEventType = "ready" | "resync" | "message" | "conversation" | "order";

export interface IInboxEvent {
  type: TInboxEventType;
  id?: string | null;
  conversation_id?: string | null;
}

const EVENT_TYPES: TInboxEventType[] = ["ready", "resync", "message", "conversation", "order"];

// A reply lands as several events at once (the message, the thread's unread
// count, its attention flag). Gathering them for a moment turns that into one
// refetch instead of three.
const BATCH_MS = 250;

/**
 * The shop's inbox changes, pushed by the API over Server-Sent Events.
 *
 * Calls `onEvents` with each batch. Returns whether the stream is connected,
 * so a caller can fall back to polling while it is not — EventSource
 * reconnects on its own, and says "ready" when it is back.
 */
export function useInboxEvents(onEvents: (events: IInboxEvent[]) => void): boolean {
  const [connected, setConnected] = useState(false);
  const handler = useRef(onEvents);
  useEffect(() => {
    handler.current = onEvents;
  }, [onEvents]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;
    // The session is an HttpOnly cookie, so the stream needs credentials.
    const source = new EventSource(`${BASE_URL}${API_V1}/events`, { withCredentials: true });
    let pending: IInboxEvent[] = [];
    let timer: number | undefined;

    const flush = () => {
      timer = undefined;
      const batch = pending;
      pending = [];
      if (batch.length) handler.current(batch);
    };

    const listener = (type: TInboxEventType) => (event: MessageEvent) => {
      let data: Partial<IInboxEvent> = {};
      try {
        data = JSON.parse(event.data);
      } catch {
        // A heartbeat or a malformed line: nothing to refetch for it.
      }
      if (type === "ready") setConnected(true);
      pending.push({ ...data, type });
      if (timer === undefined) timer = window.setTimeout(flush, BATCH_MS);
    };

    const listeners = EVENT_TYPES.map((type) => [type, listener(type)] as const);
    for (const [type, fn] of listeners) source.addEventListener(type, fn as EventListener);
    source.onerror = () => setConnected(false);

    return () => {
      for (const [type, fn] of listeners) source.removeEventListener(type, fn as EventListener);
      window.clearTimeout(timer);
      source.close();
      setConnected(false);
    };
  }, []);

  return connected;
}
