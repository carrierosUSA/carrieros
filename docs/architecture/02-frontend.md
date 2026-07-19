# 02 — Frontend Architecture

## Purpose

Target UI architecture for `carrieros-app` (Next.js App Router). Aligns with CarrierOS product design (calm, progressive disclosure) without violating `/constitution`.

---

## Stack (current → target)

| Concern | Current | Target |
|---------|---------|--------|
| Framework | Next.js 16 App Router | Same |
| UI | React 19, Tailwind 4, `components/` | Shared UI kit + domain components |
| State | Local stores / seed data in `lib/*/store` | Server as source of truth; client cache for UX |
| Maps | Leaflet | Keep; lazy-load |
| Icons | lucide-react | Keep |

**Do not overengineer:** no Redux/global client store by default. Prefer RSC + server actions; light client state for forms, modals, optimistic UI.

---

## App Router surfaces

| Route prefix | Audience | Notes |
|--------------|----------|-------|
| `/dashboard`, `/loads`, `/fleet`, `/drivers`, … | Carrier ops | Main AppShell |
| `/driver/*` | Drivers | Mobile-first; offline-aware (`lib/driver-app`) |
| `/portal/*` | Brokers/customers | Limited data, MFA path exists |
| `/platform/*` | Governance, migration, apps | Constitution-facing |
| `/alph`, `/alph/copilot/*` | AI assistant UIs | Always show confidence + confirm |
| `/exchange/*`, `/marketplace` | Marketplace | Independent module (Phase 2 extractable) |
| `/wallet/*`, `/network/*` | Trust identity | Share grants explicit |
| `/track/[token]` | Public tracking | Token-scoped, no session leak |
| `/admin` | Platform admin | Hard AuthZ |

Layouts: root `app/layout.tsx` + segment layouts (`app/loads/layout.tsx`, etc.). Loading/error boundaries per domain already appearing — keep that pattern.

---

## Shared UI library

**Target:** `components/ui/` (primitives) + `components/<domain>/` (composites).

| Layer | Examples | Rules |
|-------|----------|-------|
| Primitives | Button, Input, Badge, Card, PageHeader | No domain imports |
| Patterns | AppShell, Sidebar, MetricCard, SearchBar | Layout/chrome only |
| Domain | DriverCard, load rows, document viewers | Call hooks/services; no raw SQL |

Design tokens: `lib/design-system/` + `app/globals.css`. **Canonical UI docs:** [`docs/design-system/00-README.md`](../design-system/00-README.md). Prefer spacing/typography over borders (product design rule).

---

## Rendering model

| Pattern | Use when |
|---------|----------|
| RSC (default) | Lists, detail pages, dashboards |
| Server Actions | Mutations with AuthZ + audit |
| Client Components | Maps, rich editors, live tracking, offline queue |
| Streaming / Suspense | Slow widgets (analytics, maps) |

SSR for SEO only where public (`/track`, marketing). Ops app is authenticated — prioritize TTFB and cache headers over SEO.

---

## State strategy

1. **Server state** — Postgres via repositories; invalidate with `revalidatePath` / tags.
2. **URL state** — filters, tabs, selected IDs.
3. **Ephemeral UI state** — modals, draft forms.
4. **Offline queue (Driver App)** — `lib/driver-app/offline-queue.ts` pattern; sync with conflict resolve + human visibility.

Avoid duplicating domain logic in multiple client stores. Migrate seed stores (`lib/*/store.ts`) toward repositories as persistence lands.

---

## Portals & shells

```
AppShell (ops)
  ├── Sidebar nav (module-aware, permission-filtered)
  ├── Command palette (lib/command-palette)
  └── Alph entry (gated suggestions)

Driver shell
  ├── Bottom nav / trip-first
  └── Offline indicator

Portal shell
  └── Narrow nav (loads, invoices, documents, messages)
```

Permissions filter nav items (`lib/permissions`) — never hide-only security.

---

## Performance

| Practice | Detail |
|----------|--------|
| Code-split | Heavy routes: maps, exchange, analytics |
| Images | Next Image / CDN; document thumbnails async |
| Lists | Virtualize only when > ~100 visible rows |
| Skeletons | `loading.tsx` on `#F5F7FA` — no blank white |
| Bundle | Keep Leaflet, chart libs route-local |

**Scale note:** at 1k+ trucks, dashboards must aggregate server-side; never ship full fleet JSON to the browser.

---

## Accessibility

- Semantic headings, labels on all controls
- Keyboard: command palette + critical workflows
- Focus management in modals
- Color is semantic (blue/green/orange/red/gray) — not the only signal
- Target WCAG 2.1 AA for ops and driver flows

---

## Alph / AI UI rules

From Constitution + `lib/ai-safety/`:

- Show confidence (High / Medium / Needs verification)
- Critical actions require explicit confirm UI
- Never present AI as operator of the business
- Surface audit-friendly copy (“Suggested”, “Draft”, “Needs approval”)

---

## Mapping to today

| Target | Current |
|--------|---------|
| `app/(ops)/…` route groups | Flat `app/loads`, `app/fleet`, … |
| `components/ui` | Root `components/*.tsx` + `components/ui` |
| Domain components | `components/loads`, `components/fleet`, … |
| Driver | `app/driver`, `lib/driver-app`, `lib/driver-mobile` |

Incremental route groups are optional; do not mass-move folders without need.
