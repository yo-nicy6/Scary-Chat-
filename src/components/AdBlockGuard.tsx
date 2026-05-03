import { useEffect, useState } from "react";

async function detectAdBlock(): Promise<boolean> {
  // Method 1: bait element with ad-related class names
  const bait = document.createElement("div");
  bait.innerHTML = "&nbsp;";
  bait.className =
    "adsbox ad-banner ad-placement ads ad-unit pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links";
  bait.style.cssText =
    "position:absolute!important;left:-9999px!important;top:-9999px!important;width:1px;height:1px;";
  document.body.appendChild(bait);

  await new Promise((r) => setTimeout(r, 120));

  const blockedByBait =
    bait.offsetHeight === 0 ||
    bait.offsetParent === null ||
    getComputedStyle(bait).display === "none" ||
    getComputedStyle(bait).visibility === "hidden";

  bait.remove();

  if (blockedByBait) return true;

  // Method 2: try fetching a known ad script URL
  try {
    await fetch(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
      { method: "HEAD", mode: "no-cors", cache: "no-store" }
    );
    return false;
  } catch {
    return true;
  }
}

export function AdBlockGuard() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const isBlocked = await detectAdBlock();
      if (!cancelled) setBlocked(isBlocked);
    };
    run();
    const interval = setInterval(run, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md p-6"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-elevated">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15">
          <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-destructive" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M4.93 4.93l14.14 14.14" />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-destructive">Ad Blocker Detected</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Please <strong className="text-foreground">disable your Ad Blocker</strong> to continue using
          Scary Chat. Our content is supported by ads — thanks for understanding!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
        >
          I have disabled it — Reload
        </button>
      </div>
    </div>
  );
}
