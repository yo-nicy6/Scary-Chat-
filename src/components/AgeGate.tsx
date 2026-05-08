import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "sc_age_ok_v1";

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="mx-4 w-full max-w-md rounded-3xl border border-primary/40 bg-card p-8 shadow-elevated">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
          18+
        </div>
        <h2 className="mb-2 text-2xl font-bold">Adults Only</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          This site contains content intended for adults aged 18 or older. By entering, you confirm that you are of legal age in your jurisdiction.
        </p>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={accept}>I am 18+ — Enter</Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => { window.location.href = "https://www.google.com"; }}
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
