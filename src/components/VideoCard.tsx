import { Link } from "react-router-dom";
import type { Post } from "@/lib/types";

export function VideoCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/post/${post.id}/step-1`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">{post.title}</h3>
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
