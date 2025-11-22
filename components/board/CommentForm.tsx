"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface CommentFormProps {
  onSubmit: (content: string, parentId?: number | null) => void;
  onCancel?: () => void;
  parentId?: number | null;
  placeholder?: string;
  isSubmitting?: boolean;
}

export default function CommentForm({
  onSubmit,
  onCancel,
  parentId,
  placeholder = "เขียนคอมเมนต์...",
  isSubmitting = false,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isSubmitting) {
      onSubmit(content.trim(), parentId);
      setContent("");
      if (onCancel) onCancel();
    }
  };

  if (!user) {
    return (
      <Card className="border-none shadow-none bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-muted/30">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
              {user.display_name || user.username || "U"
                ? (user.display_name || user.username || "U")
                    .charAt(0)
                    .toUpperCase()
                : "?"}
            </div>

            {/* Textarea */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder={placeholder}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  {content.length} ตัวอักษร
                </div>
                <div className="flex gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      ยกเลิก
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        ส่ง
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

