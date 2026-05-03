# Video Redirect Platform — Implementation Plan

A modern, fast video content site with a 2-step redirection flow, Firebase backend, and a full admin panel.

## Public Site

**Homepage (`/`)**
- Responsive grid of video cards (thumbnail, title, hover lift + soft shadow)
- Skeleton shimmer placeholders while Firestore loads
- Header ad slot, footer ad slot
- Black/white theme, rounded cards, soft elevation

**Step 1 page (`/post/:id/step-1`)**
- Title, thumbnail, description, "Step 1" label, "1/2" progress bar
- Button "Click Here for Link":
  - First N clicks (configurable per post) open the Step 1 ad link in a new tab
  - After required clicks → button becomes "Please wait 8s…" with countdown
  - When timer ends → button becomes "Continue to Step 2" → routes to Step 2
- Red glow animation on click, in-content ad slot
- Tracks: page view, each click, completion

**Step 2 page (`/post/:id/step-2`)**
- Same layout, "Step 2" label, "2/2" progress
- Same click + timer logic using Step 2 ad link
- Final button "Get Video Link" → opens final video link
- Tracks: view, clicks, final conversion

**UX details**
- Skeleton loaders on all data-loading screens
- Smooth Framer-style transitions between steps
- Mobile-first responsive layout
- Referrer captured on first visit (direct / social / other)

## Admin Panel (hidden route `/secret-admin`)

**Login** — Firebase Auth (email/password). Only authenticated users see admin UI.

**Dashboard**
- Cards: total posts, total clicks, Step1→Step2 conversion %, Step2→Final %
- Per-post click table (views, step1 clicks, step2 clicks, final conversions)
- Top referrers breakdown (direct / social / other)

**Post Manager**
- List with edit/delete
- Create/Edit form fields:
  - Title, thumbnail URL, description
  - Final video link
  - Step 1 ad link, Step 2 ad link
  - Required clicks (number)
  - Timer duration (seconds)
- Publishing auto-generates the two step routes (dynamic from `:id`)

**Ads Manager**
- Global slots: header, footer, in-content, popup/interstitial
- Each slot stores raw HTML/script snippet
- Per-post override toggle (optional override fields on the post)
- Live updates — no redeploy needed

## Data Model (Firestore)

```text
posts/{id}
  title, thumbnail, description,
  finalLink, step1AdLink, step2AdLink,
  requiredClicks, timerSeconds,
  createdAt

ads/global
  headerHtml, footerHtml, inContentHtml, popupHtml

analytics/{postId}
  views, step1Clicks, step2Clicks, finalConversions,
  referrers: { direct, social, other }

events/{autoId}   (optional raw log)
  postId, type, referrer, ts
```

Security rules: posts/ads readable by anyone, writable only by authenticated admin; analytics increments allowed from client via specific fields.

## Technical Notes

- Stack: React + Vite + Tailwind + shadcn/ui + React Router (already in project)
- Firebase SDK initialized with the provided config in `src/lib/firebase.ts`
- Firestore for data; Firebase Auth for admin
- Routes added to `App.tsx`:
  - `/`, `/post/:id/step-1`, `/post/:id/step-2`
  - `/secret-admin`, `/secret-admin/posts`, `/secret-admin/ads`
- Reusable `<AdSlot slot="header" />` component pulls from `ads/global`
- Skeleton components from shadcn for loaders
- Click tracking via Firestore `increment()` before redirect

## Out of Scope (for v1)

- Image uploads (use thumbnail URLs; can add Firebase Storage later)
- Multi-admin role management
- Real geo/device analytics beyond referrer category
