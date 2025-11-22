"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, Reply, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, CommentNotification } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function NotificationButton() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<CommentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    try {
      const response = await apiClient.getCommentNotifications({
        page: 1,
        limit: 20,
      });
      if (response.status === "success" && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await apiClient.getUnreadNotificationCount();
      if (response.status === "success" && response.data) {
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Poll unread count every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, user]);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await apiClient.markNotificationsAsRead();
      if (response.status === "success") {
        // Update notifications to mark all as read
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_new: 0 }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const handleNotificationClick = (notification: CommentNotification) => {
    setIsOpen(false);
    router.push(`/post/${notification.post_id}`);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="p-0">การแจ้งเตือน</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="rounded-full bg-muted p-2">
                <svg
                  className="h-4 w-4 text-muted-foreground animate-spin"
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
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.comment_id}
                  className="p-0 focus:bg-muted cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={cn(
                      "w-full p-4 space-y-2",
                      notification.is_new === 1 && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {notification.commenter_avatar ? (
                          <img
                            src={notification.commenter_avatar}
                            alt={notification.commenter_display_name || notification.commenter_username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {(notification.commenter_display_name || notification.commenter_username).charAt(0)}
                            </span>
                          </div>
                        )}
                        {notification.notification_type === "reply" ? (
                          <Reply className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full p-0.5" />
                        ) : (
                          <MessageSquare className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full p-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {notification.commenter_display_name || notification.commenter_username}
                              <span className="text-muted-foreground font-normal ml-1">
                                {notification.notification_type === "reply"
                                  ? "ตอบกลับความคิดเห็นของคุณ"
                                  : "แสดงความคิดเห็นในโพสต์"}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {notification.content}
                            </p>
                          </div>
                          {notification.is_new === 1 && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {notification.post_title}
                          </p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm font-medium">ไม่มีการแจ้งเตือน</p>
              <p className="text-xs text-muted-foreground mt-1">
                คุณจะได้รับการแจ้งเตือนเมื่อมีคนแสดงความคิดเห็นหรือตอบกลับคุณ
              </p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => {
                setIsOpen(false);
                // Navigate to notifications page
                window.location.href = "/notifications";
              }}
            >
              ดูทั้งหมด
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

