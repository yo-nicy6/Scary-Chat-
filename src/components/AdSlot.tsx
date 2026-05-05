import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig, AdSlotConfig, AdSlotKey } from "@/lib/types";

const legacyMap: Partial<Record<AdSlotKey, keyof AdsConfig>> = {
  header: "headerHtml",
  footer: "footerHtml",
  inContent: "inContentHtml",
  popup: "popupHtml",
};

export function resolveSlot(cfg: AdsConfig | undefined, slot: AdSlotKey): AdSlotConfig {
  const direct = cfg?.[slot] as AdSlotConfig | undefined;
  if (direct && typeof direct === "object" && "html" in direct) {
    return { html: direct.html || "", enabled: direct.enabled !== false };
  }
  const legacyKey = legacyMap[slot];
  const legacyHtml = legacyKey ? (cfg?.[legacyKey] as string | undefined) : undefined;
  return { html: legacyHtml || "", enabled: !!legacyHtml };
}

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
  override,
  className,
}: {
  slot: AdSlotKey;
  override?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (override !== undefined) {
      setHtml(override);
      setEnabled(true);
      return;
    }
    const unsub = onSnapshot(doc(db, "ads", "global"), (snap) => {
      const cfg = (snap.data() as AdsConfig | undefined) || {};
      const r = resolveSlot(cfg, slot);
      setHtml(r.html);
      setEnabled(r.enabled);
    });
    return () => unsub();
  }, [slot, override]);

  useEffect(() => {
    if (!ref.current) return;
    if (!enabled || !html) {
      ref.current.innerHTML = "";
      return;
    }
    injectHtmlWithScripts(ref.current, html);
  }, [html, enabled]);

  if (!enabled || !html) return null;
  return <div ref={ref} className={className} />;
}
