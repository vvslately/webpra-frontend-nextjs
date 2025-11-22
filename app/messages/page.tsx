"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/board/Header";
import { AppSidebar } from "@/components/board/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { FadeUp } from "@/components/animations/FadeUp";
import { apiClient, Conversation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { MessagesSquare, Search, User } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getConversations({
          page: pagination.page,
          limit: pagination.limit,
        });

        if (response.status === "success" && response.data) {
          setConversations(response.data.conversations);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อความ");
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user, pagination.page]);

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (conv.other_display_name || conv.other_username || "")
        .toLowerCase()
        .includes(query) ||
      (conv.last_message?.content || "").toLowerCase().includes(query)
    );
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </main>
        </SidebarInset>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          <FadeUp>
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <MessagesSquare className="h-8 w-8 text-primary" />
                  ข้อความ
                </h2>
                <p className="text-muted-foreground mt-1">
                  การสนทนาของคุณ
                </p>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="ค้นหาข้อความ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations List */}
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
                  <h3 className="text-lg font-semibold mb-2">กำลังโหลดข้อความ...</h3>
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
                  <Button onClick={() => window.location.reload()}>
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/messages/${conv.id}`}
                      className="block"
                    >
                      <div
                        className={cn(
                          "p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                          (conv.unread_count || 0) > 0 && "bg-primary/5 border-primary/20"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {conv.other_avatar_url ? (
                              <img
                                src={conv.other_avatar_url}
                                alt={conv.other_display_name || conv.other_username}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            {(conv.unread_count || 0) > 0 && (
                              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                {conv.unread_count! > 99 ? "99+" : conv.unread_count}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold line-clamp-1">
                                {conv.other_display_name || conv.other_username}
                              </h3>
                              {conv.last_message && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatRelativeTime(conv.last_message.created_at)}
                                </span>
                              )}
                            </div>
                            {conv.last_message ? (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {conv.last_message.sender_id === user.id ? (
                                  <span className="font-medium">คุณ: </span>
                                ) : (
                                  ""
                                )}
                                {conv.last_message.content}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                ยังไม่มีข้อความ
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <MessagesSquare className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "ไม่พบผลการค้นหา" : "ยังไม่มีข้อความ"}
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery
                      ? "ลองค้นหาด้วยคำอื่น"
                      : "เริ่มการสนทนาใหม่กับเพื่อนของคุณ"}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-6">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-sm text-muted-foreground">
                    หน้า {pagination.page} จาก {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </div>
          </FadeUp>
        </main>
      </SidebarInset>
    </div>
  );
}

