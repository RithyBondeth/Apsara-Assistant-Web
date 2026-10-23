import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInboxEvents } from "./use-inbox-events";

class FakeEventSource {
  static last: FakeEventSource | null = null;
  listeners = new Map<string, (event: MessageEvent) => void>();
  onerror: (() => void) | null = null;
  closed = false;
  constructor(public url: string, public init?: EventSourceInit) {
    FakeEventSource.last = this;
  }
  addEventListener(type: string, fn: (event: MessageEvent) => void) {
    this.listeners.set(type, fn);
  }
  removeEventListener(type: string) {
    this.listeners.delete(type);
  }
  close() {
    this.closed = true;
  }
  emit(type: string, data: object) {
    this.listeners.get(type)?.({ data: JSON.stringify(data) } as MessageEvent);
  }
}

describe("useInboxEvents", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("EventSource", FakeEventSource);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("opens a credentialed stream and batches a burst into one call", () => {
    const onEvents = vi.fn();
    const { result, unmount } = renderHook(() => useInboxEvents(onEvents));
    const source = FakeEventSource.last!;
    expect(source.url).toMatch(/\/api\/v1\/events$/);
    expect(source.init?.withCredentials).toBe(true);
    expect(result.current).toBe(false);

    act(() => {
      source.emit("ready", { type: "ready" });
      source.emit("message", { type: "message", id: "m1", conversation_id: "c1" });
      source.emit("conversation", { type: "conversation", id: "c1", conversation_id: "c1" });
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(true);
    expect(onEvents).toHaveBeenCalledTimes(1);
    expect(onEvents.mock.calls[0][0].map((e: { type: string }) => e.type))
      .toEqual(["ready", "message", "conversation"]);

    act(() => source.onerror?.());
    expect(result.current).toBe(false);
    unmount();
    expect(source.closed).toBe(true);
  });
});
