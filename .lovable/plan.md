## Problem

Two issues with the Ads system:

1. **Saved ad code doesn't actually run.** `AdSlot` uses `dangerouslySetInnerHTML`, but browsers do **not** execute `<script>` tags injected that way. So pasting AdSense / Adsterra / Monetag / PopAds snippets saves to Firestore but nothing renders or fires.
2. **Ads Manager UI is too thin** — one flat list of 4 textareas, no preview, no enable/disable, no per-slot save, no presets, no guidance.

## Fix 1 — Make ad scripts actually execute (`src/components/AdSlot.tsx`)

Rewrite the renderer so injected `<script>` tags run:

- Parse the saved HTML with `DOMParser`.
- For every node: append non-script nodes directly; for `<script>` nodes, create a fresh `document.createElement("script")`, copy attributes (`src`, `async`, `data-*`, `type`, etc.) and `textContent`, then append. Browsers only execute scripts created this way.
- Clear container on each Firestore update so re-saves don't stack duplicates.
- Respect a new `enabled` flag — if the slot is disabled, render nothing.
- Keep the existing `onSnapshot` listener so saving in admin updates every open tab instantly.

## Fix 2 — Expand the data model (`src/lib/types.ts`)

Replace the 4-field `AdsConfig` with a richer per-slot object:

```ts
type AdSlotConfig = { html: string; enabled: boolean; updatedAt?: number };

interface AdsConfig {
  header:     AdSlotConfig;
  footer:     AdSlotConfig;
  inContent:  AdSlotConfig;   // shown inside Step 1 + Step 2
  step1:      AdSlotConfig;   // Step-1-only extra slot
  step2:      AdSlotConfig;   // Step-2-only extra slot
  sidebar:    AdSlotConfig;   // optional side rail on desktop
  popup:      AdSlotConfig;   // interstitial / popunder
  native:     AdSlotConfig;   // native banner (Adsterra etc.)
  socialBar:  AdSlotConfig;   // sticky social bar
  global:     AdSlotConfig;   // <head>-style loader injected once site-wide
}
```

`AdSlot` reads `cfg[slot].html` only when `cfg[slot].enabled`. A new `<GlobalAdLoader />` mounted in `SiteShell` injects `global.html` once at the top of `<body>` (used for AdSense `adsbygoogle.js`, Monetag loader, etc.).

Add `<AdSlot slot="step1" />` to `Step1.tsx`, `<AdSlot slot="step2" />` to `Step2.tsx`, `<AdSlot slot="socialBar" className="fixed bottom-0 ..." />` and `<GlobalAdLoader />` in `SiteShell`.

## Fix 3 — Professional Ads Manager (`src/pages/admin/Ads.tsx`)

Full rebuild using shadcn `Tabs`, `Switch`, `Dialog`, `Badge`:

**Layout**
```text
┌─ Ads Manager ───────────────── [Save all] ─┐
│  Live changes — saving updates the site    │
│  immediately for every visitor.            │
├────────────────────────────────────────────┤
│ Tabs: Global | Header | Footer | In-content│
│       Step 1 | Step 2 | Sidebar | Popup    │
│       Native | Social Bar                  │
├────────────────────────────────────────────┤
│ [Slot card]                                │
│   Title + description + Enabled switch     │
│   Recommended sizes / network notes        │
│   Preset menu: AdSense, Adsterra, Monetag, │
│                PropellerAds, PopAds, Custom│
│   Code editor (monospace textarea, 14 rows)│
│   Char count · last updated timestamp      │
│   [Preview] [Reset] [Save this slot]       │
│                                            │
│ ▸ Live preview (sandboxed iframe, srcDoc)  │
│   renders the snippet exactly as users see │
└────────────────────────────────────────────┘
```

**Behavior**
- Per-slot **Enabled** toggle (writes immediately on change).
- Per-slot **Save** button + a top-right **Save all** that writes the whole doc.
- **Preset templates** drop ready-to-use snippets (placeholders for IDs/keys) for the common networks.
- **Live preview** uses an `<iframe sandbox="allow-scripts allow-same-origin">` with `srcDoc` so the admin can verify the code actually loads before publishing.
- **Validation hints**: warn when `<script>` has neither `src` nor body, when HTML looks empty, or when a snippet appears to be from a different network than the slot type.
- **Last updated** timestamp under each slot (`updatedAt` written via `serverTimestamp`).
- **Status badges**: green "Live" when enabled + has html, gray "Off", amber "Empty".
- Toast on save; disable Save while writing.

## Fix 4 — Backwards compatibility

Old docs only have `headerHtml` / `footerHtml` / `inContentHtml` / `popupHtml`. On first load, migrate them in-memory into the new shape so the admin and `AdSlot` keep working; saving writes the new structure.

## Files touched

- `src/components/AdSlot.tsx` — DOMParser + real `<script>` execution, `enabled` flag, cleanup.
- `src/components/GlobalAdLoader.tsx` — **new**, injects site-wide loader scripts once.
- `src/components/SiteShell.tsx` — mount `GlobalAdLoader` + `socialBar` slot.
- `src/pages/Step1.tsx` / `src/pages/Step2.tsx` — add per-step ad slots.
- `src/lib/types.ts` — new `AdsConfig` shape.
- `src/pages/admin/Ads.tsx` — full rebuild (tabs, presets, preview, per-slot save, switches, badges).

No new dependencies required.
