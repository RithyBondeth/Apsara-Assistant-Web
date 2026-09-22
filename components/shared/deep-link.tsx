"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface DeepLinkProps {
  /** The query parameter to watch, e.g. `conversation` in `/chat?conversation=…`. */
  param: string;
  /** Called once per distinct value — links from Telegram alerts land here. */
  onValue: (value: string) => void;
}

function Reader({ param, onValue }: DeepLinkProps) {
  const value = useSearchParams().get(param);
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!value || handled.current === value) return;
    handled.current = value;
    onValue(value);
  }, [value, onValue]);
  return null;
}

/**
 * Opens whatever a `?param=id` link points at. `useSearchParams` needs a
 * Suspense boundary to prerender, so it lives in this leaf rather than in
 * every page that wants a deep link.
 */
export default function DeepLink(props: DeepLinkProps) {
  return (
    <Suspense fallback={null}>
      <Reader {...props} />
    </Suspense>
  );
}
