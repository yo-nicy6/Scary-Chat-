import { doc, increment, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type ReferrerCategory = "direct" | "social" | "other";

export function categorizeReferrer(ref: string): ReferrerCategory {
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    const social = ["facebook", "instagram", "twitter", "x.com", "t.co", "tiktok", "youtube", "youtu.be", "reddit", "pinterest", "linkedin", "whatsapp", "telegram", "snapchat"];
    if (social.some((s) => host.includes(s))) return "social";
    if (host === window.location.hostname) return "direct";
    return "other";
  } catch {
    return "direct";
  }
}

export async function trackEvent(postId: string, field: string, withReferrer = false) {
  try {
    const data: Record<string, unknown> = { [field]: increment(1) };
    if (withReferrer) {
      const cat = categorizeReferrer(document.referrer);
      data[`referrers.${cat}`] = increment(1);
    }
    await setDoc(doc(db, "analytics", postId), data, { merge: true });
  } catch (e) {
    console.error("trackEvent failed", e);
  }
}
