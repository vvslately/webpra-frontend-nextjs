"use client";

import { useState, useEffect } from "react";
import Header from "@/components/board/Header";
import SearchBar from "@/components/board/SearchBar";
import PostCard from "@/components/board/PostCard";
import CreatePostButton from "@/components/board/CreatePostButton";
import { AppSidebar } from "@/components/board/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { FadeUp } from "@/components/animations/FadeUp";
import { Category } from "@/lib/types";
import { apiClient, Post as ApiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";

// Mock categories for now (can be replaced with API later)
const mockCategories: Category[] = [
  { id: "1", name: "ทั่วไป", postCount: 45, color: "#3b82f6" },
  { id: "2", name: "คำถาม-ตอบ", postCount: 32, color: "#10b981" },
  { id: "3", name: "ช่วยเหลือ", postCount: 28, color: "#f59e0b" },
  { id: "4", name: "ประกาศ", postCount: 15, color: "#ef4444" },
  { id: "5", name: "ออฟท็อป", postCount: 12, color: "#8b5cf6" },
];

// Helper function to convert API Post to UI Post format
function convertApiPostToUIPost(apiPost: ApiPost): any {
  return {
    id: apiPost.id.toString(),
    title: apiPost.title,
    content: apiPost.description,
    author: {
      id: apiPost.user_id.toString(),
      name: apiPost.display_name || apiPost.username || "ไม่ระบุชื่อ",
      avatar: apiPost.user_avatar,
    },
    category: mockCategories[0], // Default category for now
    createdAt: apiPost.created_at,
    updatedAt: apiPost.updated_at,
    views: apiPost.view_count || 0,
    replies: 0, // Not available in API yet
    isPinned: false, // Not available in API yet
    isLocked: false, // Not available in API yet
    tags: apiPost.tags?.map((tag) => tag.name) || [],
    price: apiPost.price,
    contact_info: apiPost.contact_info,
    status: apiPost.status,
    images: apiPost.images || [],
  };
}

export default function MyPostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "view_count" | "price">("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // Fetch my posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getMyPosts({
          status: statusFilter || undefined,
          search: searchQuery || undefined,
          page: pagination.page,
          limit: pagination.limit,
          sort: sortBy,
          order: sortOrder,
        });

        if (response.status === "success" && response.data) {
          setPosts(response.data.posts);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดโพสต์");
        console.error("Error fetching my posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, statusFilter, pagination.page, sortBy, sortOrder]);

  // Convert API posts to UI format
  const uiPosts = posts.map(convertApiPostToUIPost);

  // Sort: pinned first, then by date (already sorted by API, but we can re-sort if needed)
  const sortedPosts = [...uiPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        
        <main className="flex-1 p-6">
          <FadeUp>
            {/* Hero Section */}
            <div className="mb-8 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">โพสของคุณ</h2>
                <p className="text-muted-foreground mt-1">
                  {isLoading
                    ? "กำลังโหลด..."
                    : `พบ ${pagination.total} โพสต์${pagination.totalPages > 1 ? ` (หน้า ${pagination.page} จาก ${pagination.totalPages})` : ""}`}
                </p>
              </div>
              <CreatePostButton />
            </div>

          {/* Search Bar and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SearchBar 
              value={searchQuery} 
              onChange={(value) => {
                setSearchQuery(value);
                setPagination({ ...pagination, page: 1 }); // Reset to page 1 on search
              }} 
            />
            <div className="flex items-center gap-4">
              <select 
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                <option value="">ทุกสถานะ</option>
                <option value="draft">ฉบับร่าง</option>
                <option value="active">เปิดใช้งาน</option>
                <option value="sold">ขายแล้ว</option>
                <option value="closed">ปิดแล้ว</option>
              </select>
              <select 
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split("-");
                  setSortBy(sort as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
              >
                <option value="created_at-DESC">ล่าสุด</option>
                <option value="updated_at-DESC">อัปเดตล่าสุด</option>
                <option value="view_count-DESC">ยอดนิยม</option>
                <option value="price-ASC">ราคาต่ำ-สูง</option>
                <option value="price-DESC">ราคาสูง-ต่ำ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                className="h-8 w-8 text-muted-foreground animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">กำลังโหลดโพสต์...</h3>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-destructive/15 p-4 mb-4">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="space-y-12">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} showEditButton={true} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">ไม่พบโพสต์</h3>
            <p className="text-muted-foreground max-w-sm">
              {searchQuery || statusFilter
                ? "ลองค้นหาด้วยคำอื่น หรือล้างตัวกรอง"
                : "ยังไม่มีโพสต์ของคุณในระบบ"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted transition-colors"
            >
              ก่อนหน้า
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination({ ...pagination, page: pageNum })}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted transition-colors"
            >
              ถัดไป
            </button>
          </div>
        )}
          </FadeUp>
        </main>
      </SidebarInset>
    </div>
  );
}
