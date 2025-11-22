import { Post } from "@/lib/types";
import { MessageSquare, Eye, Pin, Lock, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface PostCardProps {
  post: Post;
  showEditButton?: boolean;
}

export default function PostCard({ post, showEditButton = false }: PostCardProps) {
  const { user } = useAuth();
  const isPostOwner = user && String(user.id) === String(post.author.id);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/post/${post.id}/edit`;
  };

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article
        className={cn(
          "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md",
          post.isPinned && "border-primary/50 bg-primary/5"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Show first image if available */}
          {(post as any).images && (post as any).images.length > 0 && (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={(post as any).images[0].image_url || (post as any).images[0].thumbnail_url}
                alt={(post as any).images[0].alt_text || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {post.isPinned && (
                <Pin className="h-4 w-4 text-primary fill-primary" />
              )}
              {post.isLocked && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.content}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {post.author.name.charAt(0)}
                </div>
                <span>{post.author.name}</span>
              </div>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              {(post as any).price && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <span>
                      {new Intl.NumberFormat("th-TH", {
                        minimumFractionDigits: 0,
                      }).format((post as any).price)} บาท
                    </span>
                  </div>
                </>
              )}
              {post.category && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                    {post.category.name}
                  </span>
                </>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{post.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
            </div>
            {showEditButton && isPostOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="mt-2 gap-2"
              >
                <Edit className="h-3 w-3" />
                แก้ไข
              </Button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

