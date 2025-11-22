import configData from "@/config.json"

const API_URL = (configData as { api_url: string }).api_url

export interface ApiResponse<T> {
  status: "success" | "error"
  message?: string
  data?: T
  error?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  display_name?: string
  phone?: string
}

export interface User {
  id: number
  username: string
  email: string
  display_name?: string
  avatar_url?: string
  phone?: string
  created_at?: string
  updated_at?: string
  last_login?: string
  is_active: number
  is_admin?: number
  role?: string
}

export interface AuthResponse {
  user: User
  token: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed")
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error")
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const headers: Record<string, string> = {}

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: options.method || "POST",
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed")
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error")
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>("/auth/me", {
      method: "GET",
    })
  }

  async uploadImage(file: File): Promise<ApiResponse<{ link: string }>> {
    const formData = new FormData()
    formData.append("image", file)

    return this.requestFormData<{ link: string }>("/api/upload-image", formData)
  }

  async createPost(
    data: CreatePostRequest,
    files?: File[]
  ): Promise<ApiResponse<{ post: Post }>> {
    // If files are provided, use FormData
    if (files && files.length > 0) {
      const formData = new FormData()
      
      // Add text fields
      formData.append("title", data.title)
      formData.append("description", data.description)
      if (data.price !== null && data.price !== undefined) {
        formData.append("price", data.price.toString())
      }
      if (data.contact_info) {
        formData.append("contact_info", data.contact_info)
      }
      if (data.status) {
        formData.append("status", data.status)
      }
      if (data.tag_ids && data.tag_ids.length > 0) {
        formData.append("tag_ids", JSON.stringify(data.tag_ids))
      }
      if (data.images && data.images.length > 0) {
        formData.append("images", JSON.stringify(data.images))
      }

      // Add files
      files.forEach((file) => {
        formData.append("images", file)
      })

      return this.requestFormData<{ post: Post }>("/posts", formData)
    }

    // Otherwise use JSON
    return this.request<{ post: Post }>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getPosts(params?: GetPostsParams): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append("status", params.status)
    if (params?.user_id) queryParams.append("user_id", params.user_id.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.min_price) queryParams.append("min_price", params.min_price.toString())
    if (params?.max_price) queryParams.append("max_price", params.max_price.toString())
    if (params?.tag_id) queryParams.append("tag_id", params.tag_id.toString())
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.order) queryParams.append("order", params.order)

    const queryString = queryParams.toString()
    return this.request<{ posts: Post[]; pagination: Pagination }>(`/posts${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  }

  async getPost(id: string | number): Promise<ApiResponse<{ post: Post }>> {
    return this.request<{ post: Post }>(`/posts/${id}`, {
      method: "GET",
    })
  }

  async updatePost(
    id: string | number,
    data: CreatePostRequest,
    files?: File[]
  ): Promise<ApiResponse<{ post: Post }>> {
    // If files are provided, use FormData
    if (files && files.length > 0) {
      const formData = new FormData()
      
      // Add text fields
      if (data.title !== undefined) {
        formData.append("title", data.title)
      }
      if (data.description !== undefined) {
        formData.append("description", data.description)
      }
      if (data.price !== null && data.price !== undefined) {
        formData.append("price", data.price.toString())
      }
      if (data.contact_info !== undefined) {
        formData.append("contact_info", data.contact_info || "")
      }
      if (data.status !== undefined) {
        formData.append("status", data.status)
      }
      if (data.tag_ids && data.tag_ids.length > 0) {
        formData.append("tag_ids", JSON.stringify(data.tag_ids))
      }
      if (data.images && data.images.length > 0) {
        formData.append("images", JSON.stringify(data.images))
      }

      // Add files
      files.forEach((file) => {
        formData.append("images", file)
      })

      return this.requestFormData<{ post: Post }>(`/posts/${id}`, formData, {
        method: "PUT",
      })
    }

    // Otherwise use JSON
    return this.request<{ post: Post }>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getMyPosts(params?: GetPostsParams): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append("status", params.status)
    if (params?.search) queryParams.append("search", params.search)
    if (params?.min_price) queryParams.append("min_price", params.min_price.toString())
    if (params?.max_price) queryParams.append("max_price", params.max_price.toString())
    if (params?.tag_id) queryParams.append("tag_id", params.tag_id.toString())
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.order) queryParams.append("order", params.order)

    const queryString = queryParams.toString()
    return this.request<{ posts: Post[]; pagination: Pagination }>(`/my-posts${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  }

  // Comments
  async getComments(postId: string | number, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ comments: Comment[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const queryString = queryParams.toString()
    return this.request<{ comments: Comment[]; pagination: Pagination }>(`/posts/${postId}/comments${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  }

  async createComment(postId: string | number, data: CreateCommentRequest): Promise<ApiResponse<{ comment: Comment }>> {
    return this.request<{ comment: Comment }>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateComment(commentId: string | number, data: UpdateCommentRequest): Promise<ApiResponse<{ comment: Comment }>> {
    return this.request<{ comment: Comment }>(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteComment(commentId: string | number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/comments/${commentId}`, {
      method: "DELETE",
    })
  }

  // Favorites
  async toggleFavorite(postId: string | number): Promise<ApiResponse<{ is_favorite: boolean }>> {
    return this.request<{ is_favorite: boolean }>(`/posts/${postId}/favorite`, {
      method: "POST",
    })
  }

  async checkFavorite(postId: string | number): Promise<ApiResponse<{ is_favorite: boolean }>> {
    return this.request<{ is_favorite: boolean }>(`/posts/${postId}/favorite`, {
      method: "GET",
    })
  }

  async getFavorites(params?: GetPostsParams): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.order) queryParams.append("order", params.order)

    const queryString = queryParams.toString()
    return this.request<{ posts: Post[]; pagination: Pagination }>(`/favorites${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  }

  // Tags
  async getTags(params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ tags: PostTag[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append("search", params.search)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const queryString = queryParams.toString()
    return this.request<{ tags: PostTag[]; pagination: Pagination }>(`/tags${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  }

  async getTag(identifier: string | number): Promise<ApiResponse<{ tag: PostTag }>> {
    return this.request<{ tag: PostTag }>(`/tags/${identifier}`, {
      method: "GET",
    })
  }

  async createTag(data: { name: string; description?: string | null }): Promise<ApiResponse<{ tag: PostTag }>> {
    return this.request<{ tag: PostTag }>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Post Tags Management
  async addTagsToPost(postId: string | number, tagIds: number[]): Promise<ApiResponse<{ tags: PostTag[] }>> {
    return this.request<{ tags: PostTag[] }>(`/posts/${postId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag_ids: tagIds }),
    })
  }

  async removeTagsFromPost(postId: string | number, tagIds: number[]): Promise<ApiResponse<{ tags: PostTag[] }>> {
    return this.request<{ tags: PostTag[] }>(`/posts/${postId}/tags`, {
      method: "DELETE",
      body: JSON.stringify({ tag_ids: tagIds }),
    })
  }

  async getPostTags(postId: string | number): Promise<ApiResponse<{ tags: PostTag[] }>> {
    return this.request<{ tags: PostTag[] }>(`/posts/${postId}/tags`, {
      method: "GET",
    })
  }

  // Profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User; token?: string }>> {
    return this.request<{ user: User; token?: string }>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/profile/password", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ user: User; avatar_url: string }>> {
    const formData = new FormData()
    formData.append("avatar", file)

    return this.requestFormData<{ user: User; avatar_url: string }>("/profile/avatar", formData)
  }

  // Notifications
  async getCommentNotifications(params?: {
    page?: number
    limit?: number
    unread_only?: boolean
  }): Promise<ApiResponse<{ notifications: CommentNotification[]; unread_count: number; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.unread_only) queryParams.append("unread_only", params.unread_only.toString())

    const queryString = queryParams.toString()
    return this.request<{ notifications: CommentNotification[]; unread_count: number; pagination: Pagination }>(
      `/notifications/comments${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    )
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ unread_count: number }>> {
    return this.request<{ unread_count: number }>("/notifications/comments/unread-count", {
      method: "GET",
    })
  }

  async markNotificationsAsRead(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/notifications/comments/mark-read", {
      method: "POST",
    })
  }

  // Messages/Conversations
  async getOrCreateConversation(userId: number): Promise<ApiResponse<{ conversation: Conversation }>> {
    return this.request<{ conversation: Conversation }>("/conversations", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    })
  }

  async getConversations(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ conversations: Conversation[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const queryString = queryParams.toString()
    return this.request<{ conversations: Conversation[]; pagination: Pagination }>(
      `/conversations${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    )
  }

  async getConversationMessages(
    conversationId: string | number,
    params?: {
      page?: number
      limit?: number
      before_id?: number
    }
  ): Promise<ApiResponse<{ messages: Message[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.before_id) queryParams.append("before_id", params.before_id.toString())

    const queryString = queryParams.toString()
    return this.request<{ messages: Message[]; pagination: Pagination }>(
      `/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    )
  }

  async sendMessage(
    conversationId: string | number,
    content: string
  ): Promise<ApiResponse<{ message: Message }>> {
    return this.request<{ message: Message }>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
  }

  async markMessagesAsRead(conversationId: string | number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/conversations/${conversationId}/messages/mark-read`, {
      method: "POST",
    })
  }

  async getUnreadMessagesCount(): Promise<ApiResponse<{ unread_count: number }>> {
    return this.request<{ unread_count: number }>("/messages/unread-count", {
      method: "GET",
    })
  }

  // Config (Admin only)
  async getConfig(): Promise<ApiResponse<{ config: AppConfig }>> {
    return this.request<{ config: AppConfig }>("/api/config", {
      method: "GET",
    })
  }

  async updateConfig(data: UpdateConfigRequest): Promise<ApiResponse<{ config: AppConfig }>> {
    return this.request<{ config: AppConfig }>("/api/config", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // PromptPay QR Code
  async createPromptPayQR(amount: number): Promise<ApiResponse<PromptPayQRCode>> {
    const response = await this.request<{ data?: PromptPayQRCode }>("/api/promptpay-qr", {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
    // Backend returns data directly in response.data, not nested
    return {
      ...response,
      data: response.data as unknown as PromptPayQRCode,
    } as ApiResponse<PromptPayQRCode>
  }

  async getPromptPayQRs(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ data: PromptPayQRCode[]; pagination: any }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    const query = queryParams.toString()
    return this.request<{ data: PromptPayQRCode[]; pagination: any }>(`/api/promptpay-qr${query ? `?${query}` : ""}`, {
      method: "GET",
    })
  }

  async getPromptPayQR(id: number): Promise<ApiResponse<PromptPayQRCode>> {
    const response = await this.request<{ data?: PromptPayQRCode }>(`/api/promptpay-qr/${id}`, {
      method: "GET",
    })
    return {
      ...response,
      data: response.data as unknown as PromptPayQRCode,
    } as ApiResponse<PromptPayQRCode>
  }

  async deletePromptPayQR(id: number): Promise<ApiResponse<{}>> {
    return this.request<{}>(`/api/promptpay-qr/${id}`, {
      method: "DELETE",
    })
  }

  async confirmPromptPayPayment(amount: number): Promise<ApiResponse<{ user: User; amount_added: number; qr_code_id: number }>> {
    return this.request<{ user: User; amount_added: number; qr_code_id: number }>(`/api/promptpay-confirm/${amount}`, {
      method: "GET",
    })
  }

  async getTopupHistory(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ topups: Topup[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.status) queryParams.append("status", params.status)
    const query = queryParams.toString()
    return this.request<{ topups: Topup[]; pagination: Pagination }>(`/api/topups${query ? `?${query}` : ""}`, {
      method: "GET",
    })
  }

  async getBalance(): Promise<ApiResponse<{ money: number; points: number }>> {
    return this.request<{ money: number; points: number }>("/api/balance", {
      method: "GET",
    })
  }

  // Subscriptions
  async createSubscription(plan: string, expires_at?: string): Promise<ApiResponse<{ subscription: Subscription; amount_deducted?: number; remaining_balance?: number }>> {
    return this.request<{ subscription: Subscription; amount_deducted?: number; remaining_balance?: number }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ plan, expires_at }),
    })
  }

  async getMySubscription(): Promise<ApiResponse<{ subscription: Subscription | null; role: string }>> {
    return this.request<{ subscription: Subscription | null; role: string }>("/subscriptions/me", {
      method: "GET",
    })
  }

  async getSubscriptions(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ subscriptions: Subscription[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.status) queryParams.append("status", params.status)
    const query = queryParams.toString()
    return this.request<{ subscriptions: Subscription[]; pagination: Pagination }>(`/subscriptions${query ? `?${query}` : ""}`, {
      method: "GET",
    })
  }

  async cancelSubscription(id: number): Promise<ApiResponse<{ subscription: Subscription }>> {
    return this.request<{ subscription: Subscription }>(`/subscriptions/${id}/cancel`, {
      method: "POST",
    })
  }
}

export interface CreatePostRequest {
  title: string
  description: string
  price?: number | null
  contact_info?: string | null
  status?: "draft" | "active" | "sold" | "closed"
  images?: PostImage[]
  tag_ids?: number[]
}

export interface PostImage {
  image_url?: string
  image_path?: string | null
  thumbnail_url?: string | null
  alt_text?: string | null
  display_order?: number
  file_size?: number | null
  mime_type?: string | null
}

export interface Post {
  id: number
  user_id: number
  title: string
  description: string
  price?: number | null
  contact_info?: string | null
  status: "draft" | "active" | "sold" | "closed"
  view_count: number
  created_at: string
  updated_at: string
  username?: string
  display_name?: string
  user_avatar?: string
  images?: PostImage[]
  tags?: PostTag[]
}

export interface PostTag {
  id: number
  name: string
  slug: string
  description?: string
}

export interface GetPostsParams {
  status?: string
  user_id?: number
  search?: string
  min_price?: number
  max_price?: number
  tag_id?: number
  page?: number
  limit?: number
  sort?: "created_at" | "updated_at" | "view_count" | "price"
  order?: "ASC" | "DESC"
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Comment {
  id: number
  post_id: number
  user_id: number
  parent_id?: number | null
  content: string
  created_at: string
  updated_at: string
  username?: string
  display_name?: string
  user_avatar?: string
  replies?: Comment[]
}

export interface CreateCommentRequest {
  content: string
  parent_id?: number | null
}

export interface UpdateCommentRequest {
  content: string
}

export interface UpdateProfileRequest {
  display_name?: string | null
  email?: string
  phone?: string | null
  avatar_url?: string | null
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface CommentNotification {
  comment_id: number
  post_id: number
  parent_id: number | null
  content: string
  created_at: string
  commenter_id: number
  commenter_username: string
  commenter_display_name: string | null
  commenter_avatar: string | null
  post_title: string
  post_owner_id: number
  notification_type: "comment" | "reply"
  is_new: number
}

export interface Conversation {
  id: number
  user1_id: number
  user2_id: number
  created_at: string
  updated_at: string
  other_user_id: number
  other_username: string
  other_display_name: string | null
  other_avatar_url: string | null
  last_message?: Message | null
  unread_count?: number
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: number
  created_at: string
  updated_at: string
  sender_username: string
  sender_display_name: string | null
  sender_avatar_url: string | null
}

export interface AppConfig {
  id: number
  promptpay_number: string | null
  promptpay_name: string | null
  point_topup_enabled: boolean
  point_topup_percent: number
  created_at: string
  updated_at: string
}

export interface UpdateConfigRequest {
  promptpay_number?: string | null
  promptpay_name?: string | null
  point_topup_enabled?: boolean
  point_topup_percent?: number
}

export interface PromptPayQRCode {
  id: number
  user_id: number
  phone_number: string
  promptpay_name?: string
  amount: number
  qr_payload: string
  qr_image?: string
  created_at: string
}

export interface Topup {
  id: number
  user_id: number
  amount: number
  method: string
  transaction_ref: string
  status: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: number
  plan: string
  status: string
  expires_at: string | null
  created_at: string
  updated_at: string
  cancelled_at: string | null
}

export const apiClient = new ApiClient(API_URL)

