import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig, AdSlotKey } from "@/lib/types";
import { BUILT_IN_ADS } from "@/lib/builtInAds";

/**
 * Inject HTML into a container so that <script> tags actually execute.
 * Browsers do NOT run scripts inserted via innerHTML — we must recreate them.
 */
export function injectHtmlWithScripts(container: HTMLElement, html: string) {
  container.innerHTML = "";
  if (!html) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const frag = tpl.content;

  const walk = (node: Node, target: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") {
      const old = node as HTMLScriptElement;
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) s.setAttribute(attr.name, attr.value);
      if (old.textContent) s.text = old.textContent;
      target.appendChild(s);
      return;
    }
    const clone = node.cloneNode(false);
    target.appendChild(clone);
    node.childNodes.forEach((child) => walk(child, clone));
  };

  frag.childNodes.forEach((n) => walk(n, container));
}

export function AdSlot({
  slot,
  className,
}: {
  slot: AdSlotKey;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ads", "global"), (snap) => {
      const cfg = (snap.data() as AdsConfig | undefined) || {};
      setEnabled(!!cfg[slot]);
    });
    return () => unsub();
  }, [slot]);

  useEffect(() => {
    if (!ref.current) return;
    if (!enabled) {
      ref.current.innerHTML = "";
      return;
    }
    injectHtmlWithScripts(ref.current, BUILT_IN_ADS[slot] || "");
  }, [enabled, slot]);

  if (!enabled) return null;
  return <div ref={ref} className={className} />;
}
