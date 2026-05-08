import { Link } from "react-router-dom";
import { Eye, Lock, Users } from "lucide-react";
import type { Post } from "@/lib/types";
import { fakeViews, fakeWatchingNow } from "@/lib/fakeStats";

export function VideoCard({ post }: { post: Post }) {
  const views = fakeViews(post.id);
  const watching = fakeWatchingNow(post.id);
  return (
    <Link
      to={`/post/${post.id}/step-1`}
      className="group relative block overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover blur-sm brightness-75 transition-all duration-500 group-hover:scale-105 group-hover:blur-[2px]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
          <Users className="h-3 w-3 text-primary" /> {watching} watching
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-primary/90 px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform group-hover:scale-110">
            <Lock className="h-4 w-4" /> Tap to Unlock
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">{post.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {views} views</span>
          <span className="text-primary">🔥 Trending</span>
        </div>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
      <div className="aspect-video w-full shimmer" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-4 w-1/2 rounded shimmer" />
      </div>
    </div>
  );
}
