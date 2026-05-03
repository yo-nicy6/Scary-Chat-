import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig } from "@/lib/types";

type Slot = "header" | "footer" | "inContent" | "popup";

const fieldMap: Record<Slot, keyof AdsConfig> = {
  header: "headerHtml",
  footer: "footerHtml",
  inContent: "inContentHtml",
  popup: "popupHtml",
};

export function AdSlot({ slot, override, className }: { slot: Slot; override?: string; className?: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (override) {
      setHtml(override);
      return;
    }
    const unsub = onSnapshot(doc(db, "ads", "global"), (snap) => {
      const data = snap.data() as AdsConfig | undefined;
      setHtml((data?.[fieldMap[slot]] as string) || "");
    });
    return () => unsub();
  }, [slot, override]);

  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
