"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, CreatePostRequest, Post as ApiPost, PostImage } from "@/lib/api"
import Header from "@/components/board/Header"
import { AppSidebar } from "@/components/board/AppSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { FadeUp } from "@/components/animations/FadeUp"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MagicCard } from "@/components/registry/magicui/magic-card"
import { useTheme } from "next-themes"
import { ArrowLeft, X, Upload, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import TagSelector from "@/components/board/TagSelector"

export default function EditPostPage() {
  const params = useParams()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const postId = params.id as string

  const [formData, setFormData] = useState<CreatePostRequest>({
    title: "",
    description: "",
    price: null,
    contact_info: null,
    status: "draft",
    images: [],
    tag_ids: [],
  })
  const [existingImages, setExistingImages] = useState<PostImage[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !isAuthenticated) return

      setIsLoading(true)
      try {
        const response = await apiClient.getPost(postId)
        if (response.status === "success" && response.data?.post) {
          const post = response.data.post
          
          // Check if user owns this post
          if (String(post.user_id) !== String(user?.id)) {
            router.push(`/post/${postId}`)
            return
          }

          setFormData({
            title: post.title,
            description: post.description,
            price: post.price || null,
            contact_info: post.contact_info || null,
            status: post.status,
            images: post.images || [],
            tag_ids: post.tags?.map((tag) => tag.id) || [],
          })
          setExistingImages(post.images || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดโพสต์")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && postId) {
      fetchPost()
    }
  }, [postId, isAuthenticated, user, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 10 images total (existing + new)
    const totalImages = existingImages.length + selectedFiles.length + files.length
    const remainingSlots = 10 - (existingImages.length + selectedFiles.length)
    const newFiles = files.slice(0, remainingSlots)
    
    setSelectedFiles([...selectedFiles, ...newFiles])

    // Create previews
    const newPreviews: string[] = []
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (index: number) => {
    const newImages = existingImages.filter((_, i) => i !== index)
    setExistingImages(newImages)
    // Update formData images
    setFormData({
      ...formData,
      images: newImages,
    })
  }

  const removeNewImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title || !formData.description) {
      setError("กรุณากรอกหัวข้อและรายละเอียด")
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare images data - keep existing images that weren't removed
      const imagesToKeep = existingImages.map((img) => ({
        image_url: img.image_url,
        image_path: img.image_path,
        thumbnail_url: img.thumbnail_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        file_size: img.file_size,
        mime_type: img.mime_type,
      }))

      const updateData: CreatePostRequest = {
        ...formData,
        images: imagesToKeep,
      }

      const response = await apiClient.updatePost(postId, updateData, selectedFiles)
      if (response.status === "success" && response.data?.post) {
        router.push(`/post/${postId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปเดตโพสต์")
    } finally {
      setIsSubmitting(false)
    }
  }

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
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          <FadeUp>
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <Link
                  href={`/post/${postId}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  กลับไปดูโพสต์
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">แก้ไขโพสต์</h2>
                <p className="text-muted-foreground mt-1">
                  แก้ไขข้อมูลโพสต์ของคุณ
                </p>
              </div>

              <Card className="w-full border-none p-0 shadow-none">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <form onSubmit={handleSubmit}>
                    <CardHeader className="border-border border-b px-8 py-4 [.border-b]:pb-4 text-left">
                      <CardTitle className="text-left">ข้อมูลโพสต์</CardTitle>
                      <CardDescription className="text-left">
                        แก้ไขข้อมูลที่ต้องการเปลี่ยนแปลง
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-4 space-y-4">
                      {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                          {error}
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="title">หัวข้อ *</Label>
                        <Input
                          id="title"
                          type="text"
                          placeholder="กรุณากรอกหัวข้อโพสต์"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">รายละเอียด *</Label>
                        <textarea
                          id="description"
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="กรุณากรอกรายละเอียดโพสต์"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="price">ราคา (บาท)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          disabled={isSubmitting}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="contact_info">ข้อมูลติดต่อ</Label>
                        <Input
                          id="contact_info"
                          type="text"
                          placeholder="เบอร์โทรศัพท์, อีเมล, หรือช่องทางติดต่ออื่นๆ"
                          value={formData.contact_info || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact_info: e.target.value || null,
                            })
                          }
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="status">สถานะ</Label>
                        <select
                          id="status"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as "draft" | "active" | "sold" | "closed",
                            })
                          }
                          disabled={isSubmitting}
                        >
                          <option value="draft">แบบร่าง</option>
                          <option value="active">เผยแพร่</option>
                          <option value="sold">ขายแล้ว</option>
                          <option value="closed">ปิดการขาย</option>
                        </select>
                      </div>

                      {/* Existing Images */}
                      {existingImages.length > 0 && (
                        <div className="grid gap-2">
                          <Label>รูปภาพที่มีอยู่</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {existingImages.map((img, index) => (
                              <div
                                key={index}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-input bg-muted"
                              >
                                <img
                                  src={img.image_url || img.thumbnail_url || ""}
                                  alt={img.alt_text || `Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(index)}
                                  disabled={isSubmitting}
                                  className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image Upload */}
                      <div className="grid gap-2">
                        <Label htmlFor="images">
                          เพิ่มรูปภาพใหม่ (สูงสุด {10 - (existingImages.length + selectedFiles.length)} รูป)
                        </Label>
                        <div className="space-y-4">
                          {(existingImages.length + selectedFiles.length) < 10 && (
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="image-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากวาง
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, GIF
                                  </p>
                                </div>
                                <input
                                  id="image-upload"
                                  type="file"
                                  className="hidden"
                                  multiple
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  disabled={isSubmitting || (existingImages.length + selectedFiles.length) >= 10}
                                />
                              </label>
                            </div>
                          )}

                          {/* New Image Previews */}
                          {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {imagePreviews.map((preview, index) => (
                                <div
                                  key={index}
                                  className="relative group aspect-square rounded-lg overflow-hidden border border-input bg-muted"
                                >
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    disabled={isSubmitting}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                    {selectedFiles[index]?.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {selectedFiles.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              เพิ่มรูปใหม่ {selectedFiles.length} รูป
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <TagSelector
                        selectedTagIds={formData.tag_ids || []}
                        onChange={(tagIds) =>
                          setFormData({ ...formData, tag_ids: tagIds })
                        }
                        disabled={isSubmitting}
                      />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 border-border border-t px-8 py-4 [.border-t]:pt-4">
                      <div className="flex gap-3 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push(`/post/${postId}`)}
                          disabled={isSubmitting}
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "กำลังอัปเดตโพสต์..." : "บันทึกการแก้ไข"}
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                </MagicCard>
              </Card>
            </div>
          </FadeUp>
        </main>
      </SidebarInset>
    </div>
  )
}

