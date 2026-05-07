## 1. Move Monetag ads off `index.html` (hide them in admin)

Currently `index.html` loads three Monetag scripts (`al5sm.com/tag.min.js`, `n6wxm.com/vignette.min.js`, `libtl.com/sdk.js`). Because `index.html` boots for every route — including `/secret-admin/*` — those ad scripts also execute inside the admin panel.

**Changes**
- Edit `index.html`: keep only the `<meta name="monetag" ...>` tag. Remove the three Monetag `<script>` blocks.
- Create `src/components/MonetagLoader.tsx` that:
  - Mounts the same three scripts into `<body>` once on the public site.
  - Uses `useLocation()` to bail out (and remove already-injected scripts) when the path starts with `/secret-admin`.
  - Guards against double-injection across re-renders with a module-level flag.
- Mount `<MonetagLoader />` inside `SiteShell` (which only wraps public pages — not admin), so admin never loads them.

## 2. Replace Ads Manager with a curated "Site Ads" panel

User doesn't want to author ad code in admin. Instead the site ships built-in essential ads and admin gets simple ON/OFF + link controls.

**Changes**
- Rewrite `src/pages/admin/Ads.tsx` as a clean dashboard ("Site Ads") with cards for the bundled, important ad units only:
  1. **Monetag In-Page Push** (loader script) — ON/OFF
  2. **Monetag Vignette / Interstitial** — ON/OFF
  3. **Monetag SDK / Direct Link** — ON/OFF + direct-link URL field used by Step buttons (replaces current `step1AdLink`/`step2AdLink` if empty)
  4. **Header strip ad** — ON/OFF
  5. **In-content native** — ON/OFF
  6. **Footer banner** — ON/OFF
  7. **Sticky social bar** — ON/OFF
  - Each card shows a status badge (Live / Off), short description of where it appears, and a single Switch. No code editor, no presets, no preview — all snippets are hardcoded inside the app.
- Settings persist in Firestore `ads/global` as `{ monetagPush, monetagVignette, monetagSdk, header, inContent, footer, socialBar, monetagDirectLink }` (all booleans + one string).
- `MonetagLoader` and `AdSlot` read this config via `onSnapshot` and only inject what is enabled — so toggling in admin enables/disables ads instantly site-wide.
- Bundled HTML snippets for header / inContent / footer / socialBar live in `src/lib/builtInAds.ts` (a small map) so there is no need for the admin to ever paste code.

## 3. Step 1 / Step 2 button redesign + themed click counter

**Changes** in `src/components/StepFlow.tsx`:
- Button label during the click phase becomes **"Click Here And Press Back"** (instead of "Click Here for Link"). After required clicks: switches to wait countdown, then to the existing `completeLabel`.
- Below the button render a themed counter strip:

  ```text
  Ads to view: ●●●○○      You clicked: 2 / 3
  ```

  - Required count comes from `post.requiredClicks` (admin-controlled).
  - Filled dots use `bg-primary` with `shadow-glow`; remaining dots use `bg-muted`. Dots animate (scale + glow pulse) when a click is registered.
  - Numeric "X / Y" text uses `text-primary font-bold` with a subtle `drop-shadow` matching the red/dark theme so the user clearly sees progress.
  - Add a one-line helper under the counter: *"Tap the button, an ad will open in a new tab — just press Back to return."*
- Counter is hidden once `phase !== "click"` and replaced with the existing wait/ready state.

## Technical details

**Files to edit**
- `index.html` — strip Monetag `<script>` tags, keep meta.
- `src/components/SiteShell.tsx` — mount `<MonetagLoader />`.
- `src/components/StepFlow.tsx` — new label + themed counter dots.
- `src/lib/types.ts` — replace `AdsConfig` shape with the simpler boolean-flag config (keep legacy reads for safety).
- `src/components/AdSlot.tsx` — read new boolean flags; pull HTML from `builtInAds.ts` instead of Firestore strings.
- `src/components/GlobalAdLoader.tsx` — repurpose or delete (logic now in `MonetagLoader`).
- `src/pages/admin/Ads.tsx` — full rewrite as toggle dashboard.

**Files to create**
- `src/components/MonetagLoader.tsx` — route-aware Monetag injector.
- `src/lib/builtInAds.ts` — hardcoded snippets for the bundled slots.

**Behavior guarantees**
- Admin routes (`/secret-admin/*`) never inject Monetag or any ad snippet.
- Toggling a switch in admin updates Firestore → `onSnapshot` propagates → ads appear/disappear on the public site without reload.
- The Monetag `<meta>` tag stays in `index.html` as requested.
