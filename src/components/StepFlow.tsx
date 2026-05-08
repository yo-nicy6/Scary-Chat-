import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdSlot } from "./AdSlot";
import type { Post } from "@/lib/types";
import { showRewardedInterstitial, showRewardedPopup, isMonetagReady } from "@/lib/monetagSdk";
import { toast } from "@/hooks/use-toast";
import { Zap, Lock, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { TestimonialRotator } from "./TestimonialRotator";
import { ExitIntent } from "./ExitIntent";
import { useTabTitlePulse } from "@/hooks/useTabTitlePulse";

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

function useScarcityCountdown(seconds = 299) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function StepFlow({ post, step, adLink, onComplete, completeLabel, onClickAd, onTimerStart }: StepFlowProps) {
  const [clicks, setClicks] = useState(0);
  const [phase, setPhase] = useState<Phase>("click");
  const [remaining, setRemaining] = useState(post.timerSeconds);
  const [glow, setGlow] = useState(false);
  const [burst, setBurst] = useState(false);
  const startedRef = useRef(false);

  const required = Math.max(1, post.requiredClicks || 2);
  const expiresIn = useScarcityCountdown(299);
  useTabTitlePulse("👀 Come back — you're almost there!");

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
        setBurst(true);
        setTimeout(() => setBurst(false), 1200);
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

  let label = "Click Here And Press Back";
  if (phase === "wait") label = `Please wait ${remaining}s…`;
  if (phase === "ready") label = `🔓 ${completeLabel}`;

  const teaser = (post.description || "").split(/[.!?\n]/)[0]?.slice(0, 120) || "What happens next will surprise you…";
  const progressValue = step === 1 ? 50 : 90;

  return (
    <div className="container max-w-3xl py-8">
      <ExitIntent
        message={
          step === 1
            ? "You're 50% there! Don't lose your spot — finish Step 1 to continue."
            : "You're SO close — just one more step to unlock the full video!"
        }
      />

      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
          Step {step} of 2
        </span>
        <span className="text-sm font-bold text-primary">{progressValue}% — {step === 1 ? "almost there" : "one more step!"}</span>
      </div>
      <Progress value={progressValue} className="mb-6 h-2" />

      {step === 2 && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">You've already completed Step 1 — don't lose your progress!</p>
            <p className="text-xs text-muted-foreground">Finish this last step to unlock your video.</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-red-500">
          <Clock className="h-3.5 w-3.5" /> This unlock link expires in
        </span>
        <span className="font-mono text-base font-bold text-red-500">{expiresIn}</span>
      </div>

      <article className="rounded-3xl bg-card p-6 shadow-elevated md:p-10">
        <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">{post.title}</h1>

        {post.thumbnail && (
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-muted">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="aspect-video w-full object-cover blur-md brightness-75"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/90 via-background/30 to-transparent">
              <Lock className="mb-2 h-10 w-10 text-primary drop-shadow-[0_0_12px_hsl(var(--primary))]" />
              <p className="px-6 text-center text-sm font-semibold">{teaser}</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap below to reveal</p>
            </div>
          </div>
        )}

        <p className="mb-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
          {post.description}
        </p>

        <AdSlot slot="inContent" className="mb-6" />

        <div className="relative flex flex-col items-center gap-4">
          {burst && (
            <div className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2">
              <CheckCircle2 className="h-14 w-14 animate-ping text-primary" />
            </div>
          )}
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
            <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ads to view
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: required }).map((_, i) => {
                    const filled = i < clicks;
                    return (
                      <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                          filled
                            ? "bg-primary shadow-glow scale-110"
                            : "bg-muted border border-border"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="text-sm">
                <span className="text-muted-foreground">You clicked: </span>
                <span
                  className="font-bold text-primary"
                  style={{ textShadow: "0 0 10px hsl(var(--primary) / 0.6)" }}
                >
                  {clicks} / {required}
                </span>
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Tap the button — an ad opens in a new tab. Just press Back to return.
              </p>
            </div>
          )}

          {phase !== "ready" && (
            <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Zap className="h-3.5 w-3.5" />
                Skip the wait
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  if (!isMonetagReady()) {
                    toast({ title: "Fast Track unavailable", description: "Ad SDK is still loading. Please try again." });
                    return;
                  }
                  showRewardedInterstitial()
                    .then(() => {
                      onClickAd?.();
                      onComplete();
                    })
                    .catch(() => {
                      toast({ title: "Ad not completed", description: "Please watch the full ad to fast-track." });
                    });
                }}
              >
                <Zap className="mr-1.5 h-4 w-4" /> Fast Track (Watch Ad)
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                💎 We give you a shortcut — just one ad and you're in.
              </p>
              <button
                type="button"
                className="text-[11px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                onClick={() => {
                  showRewardedPopup().catch(() => {
                    toast({ title: "Popup blocked", description: "Allow popups to use this option." });
                  });
                }}
              >
                Or try the rewarded popup
              </button>
            </div>
          )}

          <TestimonialRotator />
        </div>
      </article>
    </div>
  );
}
