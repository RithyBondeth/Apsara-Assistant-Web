# Apsara Assistant — Web

The seller's back office for [Apsara Assistant](../Apsara-Assistant-Backend):
catalogue, inventory, customers, the unified Messenger/Telegram inbox, orders,
purchasing, returns, analytics, integrations and settings — in Khmer or
English. Next.js 16, React 19, Tailwind 4, Zustand.

## Getting started

```bash
npm install
npm run dev
```

The app expects the API at `http://localhost:8000`. Point it elsewhere with:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com npm run dev
```

That is the only environment variable. Sessions are an HttpOnly cookie set by
the API, so the API's `CORS_ORIGINS` must include this app's origin.

## Checks

```bash
npx tsc --noEmit   # types
npm run lint       # eslint
npm test           # vitest
npm run build      # what CI ships
```

CI runs all four on every pull request.

## How it fits together

```
app/(auth)/        sign-in, register, password reset, one-time code
app/(main)/        everything behind RequireAuth; one folder per sidebar entry
app/(payment)/     the page a customer lands on after Stripe Checkout
components/<area>/ page-specific pieces, each as <name>/{index.tsx, props.ts}
components/ui/     shadcn / Base UI primitives
stores/apis/       one Zustand store per API area, mirroring the backend routers
utils/constants/   API paths, sidebar entries, status styles
utils/interfaces/  the API's response shapes
language/          translations (see below)
```

A few things worth knowing before changing anything:

**Every string a seller reads comes from `language/app.en.json` and
`language/app.km.json`.** Components call `useAppT("section")` and read keys
off the result; `fmt()` fills `{placeholders}` and `plural()` picks the
`one|other` form. The two files must have identical keys and identical
placeholders — a test enforces it, because a key missing in one language
renders as nothing, silently, for that language only. The landing page keeps
its own `en.json` / `km.json`; those are marketing copy and edited separately.
Format examples the parser depends on (`Color=Red, Size=M`) stay literal.

**The language switch lives in the header** and is kept in a cookie so the
server render already knows it (no flash on reload). When a seller is signed
in, the choice is also sent to the API, so Telegram alerts arrive in the same
language as the app.

**Dates go through `utils/functions/date.ts`.** The API sends naive UTC
timestamps; `parseApiDate` appends the `Z` that JavaScript needs, and
`timeAgo`/`formatDate` take the language so "just now" is "អម្បាញ់មិញ" in Khmer.

**Telegram alerts link straight into a page.** `/chat?conversation=<id>` and
`/orders?order=<id>` are opened by `components/shared/deep-link.tsx`, which is
where to add the next one. `useSearchParams` needs a Suspense boundary to
prerender, which that component provides so pages do not have to.

**Money is per currency and never summed across.** `formatMoney` renders the
way a Cambodian shop writes it (`$12.50`, `50,000៛`); dashboards total per
currency because an order keeps the currency it was placed in.
