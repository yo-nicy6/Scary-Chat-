import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdSlot } from "./AdSlot";
import type { Post } from "@/lib/types";

type Phase = "click" | "wait" | "ready";

interface StepFlowProps {
  post: Post;
  step: 1 | 2;
  adLink: string;
  onComplete: () => void;
  completeLabel: string;
  onClickAd?: () => void;
  onTimerStart?: () => void;
}

export function StepFlow({ post, step, adLink, onComplete, completeLabel, onClickAd, onTimerStart }: StepFlowProps) {
  const [clicks, setClicks] = useState(0);
  const [phase, setPhase] = useState<Phase>("click");
  const [remaining, setRemaining] = useState(post.timerSeconds);
  const [glow, setGlow] = useState(false);
  const startedRef = useRef(false);

  const required = Math.max(1, post.requiredClicks || 2);

  useEffect(() => {
    if (phase !== "wait") return;
    setRemaining(post.timerSeconds);
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          setPhase("ready");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, post.timerSeconds]);

  const handleClick = () => {
    setGlow(true);
    setTimeout(() => setGlow(false), 400);

    if (phase === "click") {
      onClickAd?.();
      if (adLink) window.open(adLink, "_blank", "noopener,noreferrer");
      const next = clicks + 1;
      setClicks(next);
      if (next >= required) {
        setPhase("wait");
        if (!startedRef.current) {
          startedRef.current = true;
          onTimerStart?.();
        }
      }
      return;
    }
    if (phase === "ready") {
      onComplete();
    }
  };

  let label = "Click Here for Link";
  if (phase === "wait") label = `Please wait ${remaining}s…`;
  if (phase === "ready") label = completeLabel;

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
          Step {step}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{step}/2</span>
      </div>
      <Progress value={step === 1 ? 50 : 100} className="mb-8 h-2" />

      <article className="rounded-3xl bg-card p-6 shadow-elevated md:p-10">
        <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">{post.title}</h1>
        {post.thumbnail && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-muted">
            <img src={post.thumbnail} alt={post.title} className="aspect-video w-full object-cover" />
          </div>
        )}
        <p className="mb-8 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
          {post.description}
        </p>

        <AdSlot slot="inContent" className="mb-6" />
        <AdSlot slot={step === 1 ? "step1" : "step2"} className="mb-6" />
        <AdSlot slot="native" className="mb-8" />

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleClick}
            disabled={phase === "wait"}
            size="lg"
            className={`min-w-[260px] text-base font-semibold transition-all duration-300 ${
              glow ? "shadow-glow scale-[0.98]" : ""
            }`}
          >
            {label}
          </Button>
          {phase === "click" && (
            <p className="text-sm text-muted-foreground">
              {clicks}/{required} clicks
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
