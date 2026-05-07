import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig } from "@/lib/types";
import { startInAppInterstitial } from "@/lib/monetagSdk";

type Key = "monetagPush" | "monetagVignette" | "monetagSdk";

const SCRIPTS: Record<Key, () => HTMLScriptElement> = {
  monetagPush: () => {
    const s = document.createElement("script");
    s.dataset.zone = "10967697";
    s.src = "https://al5sm.com/tag.min.js";
    s.async = true;
    return s;
  },
  monetagVignette: () => {
    const s = document.createElement("script");
    s.dataset.zone = "10959965";
    s.src = "https://n6wxm.com/vignette.min.js";
    s.async = true;
    return s;
  },
  monetagSdk: () => {
    const s = document.createElement("script");
    s.src = "//libtl.com/sdk.js";
    s.dataset.zone = "10968469";
    s.dataset.sdk = "show_10968469";
    s.async = true;
    return s;
  },
};

const injected: Partial<Record<Key, HTMLScriptElement>> = {};

function removeAll() {
  (Object.keys(injected) as Key[]).forEach((k) => {
    injected[k]?.remove();
    delete injected[k];
  });
}

function sync(cfg: AdsConfig) {
  (Object.keys(SCRIPTS) as Key[]).forEach((k) => {
    const want = !!cfg[k];
    const have = !!injected[k];
    if (want && !have) {
      const s = SCRIPTS[k]();
      s.setAttribute("data-monetag-loader", k);
      document.body.appendChild(s);
      injected[k] = s;
    } else if (!want && have) {
      injected[k]?.remove();
      delete injected[k];
    }
  });
}

/**
 * Loads Monetag scripts on the public site only. Bails out (and removes any
 * already-injected scripts) when on /secret-admin routes so the admin panel
 * stays ad-free. Each script is gated by its toggle in Firestore ads/global.
 */
export function MonetagLoader() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/secret-admin");

  useEffect(() => {
    if (isAdmin) {
      removeAll();
      return;
    }
    const unsub = onSnapshot(doc(db, "ads", "global"), (snap) => {
      const cfg = (snap.data() as AdsConfig | undefined) || {};
      sync(cfg);
    });
    return () => unsub();
  }, [isAdmin]);

  return null;
}
