import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/types";
import { SiteShell } from "@/components/SiteShell";
import { StepFlow } from "@/components/StepFlow";
import { trackEvent } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Step2Page() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "posts", id));
      if (!snap.exists()) {
        setNotFound(true);
        return;
      }
      const p = { id: snap.id, ...(snap.data() as Omit<Post, "id">) };
      setPost(p);
      document.title = `${p.title} — Step 2`;
    })();
  }, [id]);

  // Back-button hijack: prompt once before letting the user leave Step 2.
  useEffect(() => {
    window.history.pushState({ step2: true }, "");
    const onPop = () => {
      const stay = window.confirm("You'll lose your progress. Leave this step?");
      if (stay) {
        window.history.back();
      } else {
        window.history.pushState({ step2: true }, "");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (notFound) {
    return (
      <SiteShell>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
        </div>
      </SiteShell>
    );
  }

  if (!post) {
    return (
      <SiteShell>
        <div className="container max-w-3xl py-10 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mx-auto h-12 w-64" />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <StepFlow
        post={post}
        step={2}
        adLink={post.step2AdLink}
        completeLabel="Unlock Full Video"
        onClickAd={() => trackEvent(post.id, "step2Clicks")}
        onComplete={() => {
          trackEvent(post.id, "finalConversions");
          if (!post.finalLink) return;
          setUnlocking(true);
          setTimeout(() => {
            window.location.href = post.finalLink;
          }, 1800);
        }}
      />
      {unlocking && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background/95 backdrop-blur">
          <div className="relative mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary drop-shadow-[0_0_24px_hsl(var(--primary))]" />
          </div>
          <p className="text-lg font-bold text-primary" style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.7)" }}>
            🔓 Unlocking your video…
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Don't close this tab</p>
        </div>
      )}
    </SiteShell>
  );
}
