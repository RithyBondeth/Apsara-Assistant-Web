import { useSyncExternalStore } from "react";

/**
 * Whether the client has hydrated — false on the server and on the first
 * client render, true from then on.
 *
 * Anything that reads the theme, the language cookie or the viewport renders
 * differently on the server than in the browser, and React treats that as a
 * hydration mismatch. Gating on this hook renders the server's version first
 * and swaps to the real one immediately after.
 *
 * `useState` + `useEffect` expresses the same thing, but a `setState` in an
 * effect body schedules a second render pass that React 19 can neither batch
 * nor optimise, which is what `react-hooks/set-state-in-effect` objects to.
 * `useSyncExternalStore` is built for exactly this shape: it takes a server
 * snapshot and a client snapshot and handles the transition itself.
 */

// Hydration happens once and never reverts, so there is nothing to subscribe
// to — the store never changes after the initial swap.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
