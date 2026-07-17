"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * Entrance animations must set their hidden starting state before the browser
 * paints, or the content flashes in unstyled first. `useEffect` runs after
 * paint, so it can't do that; `useLayoutEffect` can, but React logs a warning
 * when it runs during SSR (where it does nothing useful anyway). Swapping the
 * implementation per environment keeps the pre-paint guarantee without the
 * warning.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
