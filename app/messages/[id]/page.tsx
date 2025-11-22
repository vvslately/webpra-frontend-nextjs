"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/board/Header";
import { AppSidebar } from "@/components/board/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { FadeUp } from "@/components/animations/FadeUp";
import { apiClient, Message, Conversation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Send, User } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, formatFullDate } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!conversationId || !user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch messages first
        const messagesResponse = await apiClient.getConversationMessages(
          conversationId,
          {
            page: pagination.page,
            limit: pagination.limit,
          }
        );

        if (messagesResponse.status === "success" && messagesResponse.data) {
          setMessages(messagesResponse.data.messages);
          setPagination(messagesResponse.data.pagination);
          setHasMore(messagesResponse.data.pagination.page < messagesResponse.data.pagination.totalPages);

          // Fetch conversation details from conversations list
          const convResponse = await apiClient.getConversations({ limit: 100 });
          if (convResponse.status === "success" && convResponse.data) {
            const conv = convResponse.data.conversations.find(
              (c) => c.id === parseInt(conversationId)
            );
            if (conv) {
              setConversation(conv);
              // Mark messages as read
              await apiClient.markMessagesAsRead(conversationId);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อความ");
        console.error("Error fetching chat:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMessages(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [conversationId, user, pagination.page]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversationId || !user || isLoading) return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.getConversationMessages(conversationId, {
          page: 1,
          limit: 50,
        });

        if (response.status === "success" && response.data) {
          const newMessages = response.data.messages;
          setMessages((prev) => {
            // Merge new messages, avoiding duplicates
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNewMessages = newMessages.filter(
              (m: Message) => !existingIds.has(m.id)
            );
            return [...uniqueNewMessages, ...prev].sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId, user, isLoading]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || isSending || !conversationId) return;

    setIsSending(true);
    const contentToSend = messageContent.trim();
    setMessageContent("");

    try {
      const response = await apiClient.sendMessage(conversationId, contentToSend);
      if (response.status === "success" && response.data?.message) {
        // Add new message to list
        const messageData = response.data;
        if (messageData.message) {
          setMessages((prev) => [...prev, messageData.message]);
        }
        // Refresh conversation to update last message
        const convResponse = await apiClient.getConversations({ limit: 100 });
        if (convResponse.status === "success" && convResponse.data) {
          const conv = convResponse.data.conversations.find(
            (c) => c.id === parseInt(conversationId)
          );
          if (conv) {
            setConversation(conv);
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageContent(contentToSend); // Restore message on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMessages || !hasMore) return;

    setIsLoadingMessages(true);
    try {
      const lastMessage = messages[0];
      const response = await apiClient.getConversationMessages(conversationId, {
        page: pagination.page + 1,
        limit: pagination.limit,
        before_id: lastMessage?.id,
      });

      if (response.status === "success" && response.data) {
        const messageData = response.data;
        setMessages((prev) => [...messageData.messages, ...prev]);
        setPagination(messageData.pagination);
        setHasMore(messageData.pagination.page < messageData.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  if (authLoading || isLoading) {
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

  if (!user || !conversation) {
    return null; // Will redirect
  }

  const otherUser = {
    id: conversation.other_user_id,
    name: conversation.other_display_name || conversation.other_username,
    avatar: conversation.other_avatar_url,
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
          <FadeUp className="flex-1 flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 border-b bg-background">
                <Link
                  href="/messages"
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-3 flex-1">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{otherUser.name}</h3>
                    {conversation.last_message && (
                      <p className="text-xs text-muted-foreground">
                        ออนไลน์
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      ลองอีกครั้ง
                    </Button>
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {hasMore && (
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMoreMessages}
                          disabled={isLoadingMessages}
                          className="text-xs"
                        >
                          {isLoadingMessages ? "กำลังโหลด..." : "โหลดข้อความเก่า"}
                        </Button>
                      </div>
                    )}
                    {messages.map((message, index) => {
                      const isCurrentUser = message.sender_id === user.id;
                      const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                      const showTime =
                        index === messages.length - 1 ||
                        new Date(message.created_at).getTime() -
                          new Date(messages[index + 1].created_at).getTime() >
                          5 * 60 * 1000; // 5 minutes

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            isCurrentUser ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          {/* Avatar */}
                          {showAvatar ? (
                            <div className="flex-shrink-0">
                              {isCurrentUser ? (
                                user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.display_name || user.username}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                    {(user.display_name || user.username).charAt(0)}
                                  </div>
                                )
                              ) : otherUser.avatar ? (
                                <img
                                  src={otherUser.avatar}
                                  alt={otherUser.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-8" /> // Spacer
                          )}

                          {/* Message */}
                          <div
                            className={cn(
                              "flex flex-col gap-1 max-w-[70%]",
                              isCurrentUser ? "items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "rounded-lg px-4 py-2 break-words",
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                            {showTime && (
                              <span className="text-xs text-muted-foreground px-1">
                                {formatRelativeTime(message.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-muted-foreground">ยังไม่มีข้อความ</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      เริ่มการสนทนากับ {otherUser.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t bg-background"
              >
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={inputRef}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="min-h-[60px] max-h-[200px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageContent.trim() || isSending}
                    className="h-[60px] w-[60px] flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </FadeUp>
        </main>
      </SidebarInset>
    </div>
  );
}

