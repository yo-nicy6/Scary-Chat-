import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/types";
import { SiteShell } from "@/components/SiteShell";
import { VideoCard, VideoCardSkeleton } from "@/components/VideoCard";

const Index = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    document.title = "VidHub — Watch & Discover";
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
  }, []);

  return (
    <SiteShell>
      <section className="container py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Latest Videos</h1>
          <p className="mt-2 text-muted-foreground">Tap a card to unlock the video link.</p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts === null
            ? Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : posts.length === 0
            ? <p className="col-span-full text-center text-muted-foreground">No videos yet.</p>
            : posts.map((p) => <VideoCard key={p.id} post={p} />)}
        </div>
      </section>
    </SiteShell>
  );
};

export default Index;
