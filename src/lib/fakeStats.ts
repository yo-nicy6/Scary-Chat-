// Deterministic-ish fake stats for social proof. Stable per id within a session.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function fakeViews(id: string) {
  const base = 1200 + (hash(id) % 48000);
  return base.toLocaleString();
}

export function fakeWatchingNow(id: string) {
  return 40 + (hash(id + "w") % 380);
}

export function fakeLiveViewers() {
  // Drifts by minute so it looks alive.
  const m = Math.floor(Date.now() / 60000);
  return 980 + ((m * 7) % 1300);
}
