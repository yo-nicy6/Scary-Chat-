import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ExitIntent({ message }: { message: string }) {
  const [open, setOpen] = useState(false);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (fired) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setOpen(true);
        setFired(true);
      }
    };
    const onHide = () => {
      if (document.hidden && !fired) {
        // Don't open while hidden, but mark so re-entry can prompt once
      }
    };
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [fired]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-primary/50 bg-card p-6 shadow-elevated">
        <h3 className="mb-2 text-xl font-bold">Wait! 👀</h3>
        <p className="mb-5 text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => setOpen(false)}>Stay & finish</Button>
          <Button variant="outline" className="flex-1" onClick={() => { window.history.back(); }}>
            Leave anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
