import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const MESSAGES = [
  "🔥 24 people just unlocked a video in the last hour",
  "💎 Riya from Mumbai unlocked a video 2 min ago",
  "👀 1,284 people watching right now",
  "⚡ New trending video added — don't miss it",
  "🎬 Aman just completed Step 2 — you're next?",
];

export function SocialProofTicker() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-3 z-30 max-w-[88vw] sm:left-6 sm:max-w-sm">
      <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-4 py-2 text-xs shadow-elevated backdrop-blur animate-in fade-in slide-in-from-bottom-2">
        <Flame className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{MESSAGES[i]}</span>
        <button
          onClick={() => setShow(false)}
          className="ml-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
