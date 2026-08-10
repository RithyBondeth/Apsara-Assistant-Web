import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// The media query list is the external store. Subscribing to it directly means
// there is no local state to keep in step with it — and no `setState` in an
// effect, which is what React 19 flags as a cascading render.
function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

// The server has no viewport. Reporting desktop matches what this hook did
// before — it returned `!!undefined` until the first effect ran.
const getServerSnapshot = () => false

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
