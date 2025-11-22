"use client";

import { useState } from "react";
import { Comment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Edit2, Trash2, Reply } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/components/board/Alert";
import { formatRelativeTime } from "@/lib/time";

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: number) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  level?: number;
}

export default function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  level = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { showConfirm, ConfirmComponent } = useConfirm();


  const isOwner = user && user.id === comment.user_id;

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${level > 0 ? "ml-8 mt-4" : ""}`}>
      <Card className="border-none shadow-none bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
              {(comment.display_name || comment.username || "U").charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {comment.display_name || comment.username || "ไม่ระบุชื่อ"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comment.created_at)}
                  {comment.updated_at !== comment.created_at && (
                    <span className="ml-1">(แก้ไขแล้ว)</span>
                  )}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="เขียนคอมเมนต์..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                    >
                      บันทึก
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    {level === 0 && (
                      <button
                        onClick={() => onReply(comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Reply className="h-3 w-3" />
                        ตอบกลับ
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => {
                            showConfirm({
                              title: "ยืนยันการลบ",
                              description: "คุณแน่ใจว่าต้องการลบคอมเมนต์นี้? การกระทำนี้ไม่สามารถยกเลิกได้",
                              confirmText: "ลบ",
                              cancelText: "ยกเลิก",
                              onConfirm: () => onDelete(comment.id),
                            });
                          }}
                          className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          ลบ
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
      <ConfirmComponent />
    </div>
  );
}

