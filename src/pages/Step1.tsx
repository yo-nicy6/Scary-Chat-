import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/types";
import { SiteShell } from "@/components/SiteShell";
import { StepFlow } from "@/components/StepFlow";
import { trackEvent } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/skeleton";

export default function Step1Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);

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
      document.title = `${p.title} — Step 1`;
      trackEvent(id, "views", true);
    })();
  }, [id]);

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
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mx-auto h-12 w-64" />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <StepFlow
        post={post}
        step={1}
        adLink={post.step1AdLink}
        completeLabel="Continue to Step 2"
        onClickAd={() => trackEvent(post.id, "step1Clicks")}
        onComplete={() => {
          trackEvent(post.id, "step1Completions");
          navigate(`/post/${post.id}/step-2`);
        }}
      />
    </SiteShell>
  );
}
