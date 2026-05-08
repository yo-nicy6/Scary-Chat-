import { useEffect, useState } from "react";

const ITEMS = [
  { name: "Anjali, 23", text: "omg the wait was so worth it 🔥" },
  { name: "Karan, 27", text: "fast track button = god mode 💎" },
  { name: "Priya, 21", text: "wasn't sure but full video was 🤤" },
  { name: "Rahul, 25", text: "two ads and i was in. easy." },
  { name: "Neha, 24", text: "best site for late nights 😈" },
];

export function TestimonialRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ITEMS.length), 4500);
    return () => clearInterval(t);
  }, []);
  const it = ITEMS[i];
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
          {it.name[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{it.name}</p>
          <p key={i} className="truncate text-muted-foreground animate-in fade-in">{it.text}</p>
        </div>
      </div>
    </div>
  );
}
