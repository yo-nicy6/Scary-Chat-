import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/types";
import { SiteShell } from "@/components/SiteShell";
import { VideoCard, VideoCardSkeleton } from "@/components/VideoCard";
import { AgeGate } from "@/components/AgeGate";
import { SocialProofTicker } from "@/components/SocialProofTicker";
import { fakeLiveViewers } from "@/lib/fakeStats";
import { Flame } from "lucide-react";

const Index = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [live, setLive] = useState(fakeLiveViewers());

  useEffect(() => {
    document.title = "Scary Chat — Watch & Discover";
    (async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, "id">) })));
      } catch (e) {
        console.error(e);
        setPosts([]);
      }
    })();
    const t = setInterval(() => setLive(fakeLiveViewers()), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <SiteShell>
      <AgeGate />
      <section className="container py-8">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {live.toLocaleString()} watching now
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            <Flame className="mr-2 inline h-7 w-7 text-primary" />
            Trending Tonight
          </h1>
          <p className="mt-2 text-muted-foreground">Tap a card to unlock the full video — limited slots tonight.</p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts === null
            ? Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : posts.length === 0
            ? <p className="col-span-full text-center text-muted-foreground">No videos yet.</p>
            : posts.map((p) => <VideoCard key={p.id} post={p} />)}
        </div>
      </section>
      <SocialProofTicker />
    </SiteShell>
  );
};

export default Index;
