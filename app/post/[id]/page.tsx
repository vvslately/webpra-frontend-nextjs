"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient, Post as ApiPost, Comment } from "@/lib/api"
import Header from "@/components/board/Header"
import { AppSidebar } from "@/components/board/AppSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { FadeUp } from "@/components/animations/FadeUp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, Calendar, User, Tag, Phone, Mail, ImageIcon, Heart, MessageSquare, Edit } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CommentItem from "@/components/board/CommentItem"
import CommentForm from "@/components/board/CommentForm"
import { useAuth } from "@/contexts/auth-context"
import { useAlert } from "@/components/board/Alert"
import TagSelector from "@/components/board/TagSelector"
import { formatFullDate } from "@/lib/time"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const postId = params.id as string
  const [post, setPost] = useState<ApiPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [isUpdatingTags, setIsUpdatingTags] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showAlert, AlertComponent } = useAlert()

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.getPost(postId)
        if (response.status === "success" && response.data?.post) {
          const postData = response.data.post
          setPost(postData)
          // Set initial tag IDs
          if (postData.tags) {
            setSelectedTagIds(postData.tags.map((tag) => tag.id))
          }
          // Check if favorite
          if ((postData as any).is_favorite !== undefined) {
            setIsFavorite((postData as any).is_favorite)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดโพสต์")
        console.error("Error fetching post:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  // Fetch favorite status if logged in
  useEffect(() => {
    const checkFavorite = async () => {
      if (!postId || !user) return

      try {
        const response = await apiClient.checkFavorite(postId)
        if (response.status === "success" && response.data) {
          setIsFavorite(response.data.is_favorite)
        }
      } catch (err) {
        console.error("Error checking favorite:", err)
      }
    }

    checkFavorite()
  }, [postId, user])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return

      setIsLoadingComments(true)
      try {
        const response = await apiClient.getComments(postId, { limit: 100 })
        if (response.status === "success" && response.data) {
          setComments(response.data.comments || [])
        }
      } catch (err) {
        console.error("Error fetching comments:", err)
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchComments()
  }, [postId])


  const formatPrice = (price: number | null | undefined) => {
    if (!price) return null
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 0,
    }).format(price) + " บาท"
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: "แบบร่าง",
      active: "เผยแพร่",
      sold: "ขายแล้ว",
      closed: "ปิดการขาย",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: "bg-gray-500",
      active: "bg-green-500",
      sold: "bg-blue-500",
      closed: "bg-red-500",
    }
    return colorMap[status] || "bg-gray-500"
  }

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      const response = await apiClient.toggleFavorite(postId)
      if (response.status === "success" && response.data) {
        setIsFavorite(response.data.is_favorite)
      }
    } catch (err) {
      console.error("Error toggling favorite:", err)
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
      })
    }
  }

  // Handle comment submit
  const handleCommentSubmit = async (content: string, parentId?: number | null) => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsSubmittingComment(true)
    try {
      const response = await apiClient.createComment(postId, { content, parent_id: parentId || null })
      if (response.status === "success" && response.data) {
        // Refresh comments
        const commentsResponse = await apiClient.getComments(postId, { limit: 100 })
        if (commentsResponse.status === "success" && commentsResponse.data) {
          setComments(commentsResponse.data.comments || [])
        }
        setReplyToId(null)
      }
    } catch (err) {
      console.error("Error creating comment:", err)
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการแสดงความคิดเห็น",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle comment edit
  const handleCommentEdit = async (commentId: number, content: string) => {
    try {
      const response = await apiClient.updateComment(commentId, { content })
      if (response.status === "success" && response.data) {
        // Refresh comments
        const commentsResponse = await apiClient.getComments(postId, { limit: 100 })
        if (commentsResponse.status === "success" && commentsResponse.data) {
          setComments(commentsResponse.data.comments || [])
        }
      }
    } catch (err) {
      console.error("Error updating comment:", err)
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการแก้ไขคอมเมนต์",
      })
    }
  }

  // Handle comment delete
  const handleCommentDelete = async (commentId: number) => {
    try {
      const response = await apiClient.deleteComment(commentId)
      if (response.status === "success") {
        // Refresh comments
        const commentsResponse = await apiClient.getComments(postId, { limit: 100 })
        if (commentsResponse.status === "success" && commentsResponse.data) {
          setComments(commentsResponse.data.comments || [])
        }
      }
    } catch (err) {
      console.error("Error deleting comment:", err)
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบคอมเมนต์",
      })
    }
  }

  // Check if user is post owner
  const isPostOwner = user && post && user.id === post.user_id

  // Handle start conversation
  const handleStartConversation = async () => {
    if (!user || !post) return

    try {
      const response = await apiClient.getOrCreateConversation(post.user_id)
      if (response.status === "success" && response.data) {
        router.push(`/messages/${response.data.conversation.id}`)
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเริ่มการสนทนา",
      })
    }
  }

  // Handle tag update
  const handleUpdateTags = async () => {
    if (!post) return

    setIsUpdatingTags(true)
    try {
      const currentTagIds = post.tags?.map((tag) => tag.id) || []
      const tagsToAdd = selectedTagIds.filter((id) => !currentTagIds.includes(id))
      const tagsToRemove = currentTagIds.filter((id) => !selectedTagIds.includes(id))

      // Add new tags
      if (tagsToAdd.length > 0) {
        await apiClient.addTagsToPost(postId, tagsToAdd)
      }

      // Remove tags
      if (tagsToRemove.length > 0) {
        await apiClient.removeTagsFromPost(postId, tagsToRemove)
      }

      // Refresh post to get updated tags
      const response = await apiClient.getPost(postId)
      if (response.status === "success" && response.data?.post) {
        setPost(response.data.post)
        if (response.data.post.tags) {
          setSelectedTagIds(response.data.post.tags.map((tag) => tag.id))
        }
      }

      setIsEditingTags(false)
      showAlert({
        title: "สำเร็จ",
        description: "อัปเดตแท็กเรียบร้อยแล้ว",
      })
    } catch (err) {
      console.error("Error updating tags:", err)
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปเดตแท็ก",
      })
    } finally {
      setIsUpdatingTags(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
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
            </div>
          </main>
        </SidebarInset>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
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
                <h3 className="text-lg font-semibold mb-2">ไม่พบโพสต์</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  {error || "โพสต์ที่คุณกำลังมองหาอาจถูกลบหรือไม่มีอยู่"}
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.back()} variant="outline">
                    กลับ
                  </Button>
                  <Button onClick={() => router.push("/")}>
                    ไปหน้าแรก
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          <FadeUp>
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <div className="mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  กลับไปหน้าแรก
                </Link>
              </div>

              {/* Post Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {getStatusLabel(post.status)}
                        </span>
                        {post.price && (
                          <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                            {formatPrice(post.price)}
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-3xl mb-4">{post.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.display_name || post.username || "ไม่ระบุชื่อ"}</span>
                        </div>
                        {user && !isPostOwner && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleStartConversation}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            ส่งข้อความ
                          </Button>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatFullDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{post.view_count || 0} ครั้ง</span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        {isPostOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/post/${postId}/edit`)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            แก้ไขโพสต์
                          </Button>
                        )}
                        {user && !isPostOwner && (
                          <Button
                            variant={isFavorite ? "default" : "outline"}
                            size="sm"
                            onClick={handleToggleFavorite}
                            className={isFavorite ? "bg-primary text-primary-foreground" : ""}
                          >
                            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                            {isFavorite ? "ยกเลิกถูกใจ" : "ถูกใจ"}
                          </Button>
                        )}
                        {!user && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleFavorite}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            ถูกใจ
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">รูปภาพ ({post.images.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {post.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative group aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                            onClick={() => {
                              // Open image in new tab for full view
                              if (image.image_url) {
                                window.open(image.image_url, "_blank")
                              }
                            }}
                          >
                            {image.image_url ? (
                              <>
                                <img
                                  src={image.image_url}
                                  alt={image.alt_text || `รูปภาพ ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg
                                      className="w-12 h-12 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="w-8 h-8" /> 
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">รายละเอียด</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {post.contact_info && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">ข้อมูลติดต่อ</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{post.contact_info}</span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">แท็ก</h3>
                      {isPostOwner && !isEditingTags && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingTags(true)}
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          แก้ไขแท็ก
                        </Button>
                      )}
                    </div>
                    {isEditingTags && isPostOwner ? (
                      <div className="space-y-4">
                        <TagSelector
                          selectedTagIds={selectedTagIds}
                          onChange={setSelectedTagIds}
                          disabled={isUpdatingTags}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateTags}
                            disabled={isUpdatingTags}
                          >
                            {isUpdatingTags ? "กำลังบันทึก..." : "บันทึก"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingTags(false)
                              // Reset to current tags
                              if (post.tags) {
                                setSelectedTagIds(post.tags.map((tag) => tag.id))
                              }
                            }}
                            disabled={isUpdatingTags}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {post.tags && post.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground"
                              >
                                <Tag className="h-3 w-3" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            ยังไม่มีแท็ก
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                    <div>อัปเดตล่าสุด: {formatFullDate(post.updated_at)}</div>
                    <div>โพสต์ ID: {post.id}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    ความคิดเห็น ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Comment Form */}
                  {!replyToId && (
                    <CommentForm
                      onSubmit={handleCommentSubmit}
                      isSubmitting={isSubmittingComment}
                    />
                  )}

                  {/* Reply Form */}
                  {replyToId && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          ตอบกลับคอมเมนต์
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyToId(null)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                      <CommentForm
                        onSubmit={handleCommentSubmit}
                        onCancel={() => setReplyToId(null)}
                        parentId={replyToId}
                        placeholder="เขียนคำตอบ..."
                        isSubmitting={isSubmittingComment}
                      />
                    </div>
                  )}

                  {/* Comments List */}
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="rounded-full bg-muted p-4">
                        <svg
                          className="h-6 w-6 text-muted-foreground animate-spin"
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
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onReply={setReplyToId}
                          onEdit={handleCommentEdit}
                          onDelete={handleCommentDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>ยังไม่มีความคิดเห็น</p>
                      <p className="text-sm mt-1">เป็นคนแรกที่แสดงความคิดเห็น!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </FadeUp>
          <AlertComponent />
        </main>
      </SidebarInset>
    </div>
  )
}

