import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig } from "@/lib/types";
import { injectHtmlWithScripts, resolveSlot } from "./AdSlot";

/**
 * Mounts site-wide ad loader scripts (AdSense, Monetag, etc.) once at
 * the bottom of <body>. Re-injects when admin updates the snippet.
 */
export function GlobalAdLoader() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-global-ads", "");
    el.style.display = "none";
    document.body.appendChild(el);
    containerRef.current = el;
    return () => {
      el.remove();
      containerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ads", "global"), (snap) => {
      const cfg = (snap.data() as AdsConfig | undefined) || {};
      const r = resolveSlot(cfg, "global");
      if (!containerRef.current) return;
      if (!r.enabled || !r.html) {
        containerRef.current.innerHTML = "";
        return;
      }
      injectHtmlWithScripts(containerRef.current, r.html);
    });
    return () => unsub();
  }, []);

  return null;
}
