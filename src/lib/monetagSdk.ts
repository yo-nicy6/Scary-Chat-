// Safe wrappers around the Monetag Telegram Mini App SDK (zone 10968469).
// The SDK injects a global function `show_10968469` once `libtl.com/sdk.js`
// has loaded. All helpers below guard against the SDK being missing so the
// app never crashes if it's blocked / still loading.

type MonetagFn = ((arg?: unknown) => Promise<void>) & Record<string, unknown>;

declare global {
  interface Window {
    show_10968469?: MonetagFn;
  }
}

export function isMonetagReady(): boolean {
  return typeof window !== "undefined" && typeof window.show_10968469 === "function";
}

/** Fire-and-forget in-app interstitial autoload. */
export function startInAppInterstitial() {
  if (!isMonetagReady()) return;
  try {
    window.show_10968469!({
      type: "inApp",
      inAppSettings: {
        frequency: 2,
        capping: 0.1,
        interval: 30,
        timeout: 5,
        everyPage: false,
      },
    })?.catch?.(() => {});
  } catch {
    /* noop */
  }
}

/** Rewarded interstitial — resolves when the user finishes watching. */
export function showRewardedInterstitial(): Promise<void> {
  if (!isMonetagReady()) return Promise.reject(new Error("Monetag SDK not loaded"));
  try {
    const p = window.show_10968469!();
    return p instanceof Promise ? p : Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

/** Rewarded popup variant. */
export function showRewardedPopup(): Promise<void> {
  if (!isMonetagReady()) return Promise.reject(new Error("Monetag SDK not loaded"));
  try {
    const p = window.show_10968469!("pop");
    return p instanceof Promise ? p : Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}
