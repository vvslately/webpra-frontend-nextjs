/**
 * Client API for profile, subscription, and topup.
 * Requires auth cookie (session). Endpoints may not exist yet.
 */

const API_BASE = "";

export type UpdateProfileRequest = {
  display_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_password?: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  created_at: string;
  expires_at: string;
  cancelled_at?: string;
};

export type PromptPayQRCode = {
  amount: number;
  qr_code_url?: string;
  qr_image?: string;
  reference?: string;
  promptpay_name?: string;
  phone_number?: string;
};

export type Topup = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  method?: string;
  transaction_ref?: string;
};

type ApiResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error?: string };

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { status: "error", error: (data as { error?: string }).error || res.statusText };
  }
  return { status: "success", data: data as T };
}

async function requestFormData<T>(path: string, body: FormData): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { status: "error", error: (data as { error?: string }).error || res.statusText };
  }
  return { status: "success", data: data as T };
}

export const apiClient = {
  updateProfile(body: UpdateProfileRequest) {
    return request<{ user?: unknown; token?: string }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  changePassword(body: { current_password: string; new_password: string }) {
    return request<unknown>("/api/profile/password", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    return requestFormData<{ avatar_url?: string }>("/api/profile/avatar", form);
  },

  getBalance() {
    return request<{ money: number; points: number }>("/api/balance");
  },

  getTopupHistory(params: { page: number; limit: number }) {
    const q = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
    return request<{ topups: Topup[] }>(`/api/topup/history?${q}`);
  },

  createPromptPayQR(amount: number) {
    return request<PromptPayQRCode>("/api/topup/qr", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  confirmPromptPayPayment(amount: number) {
    return request<{ amount_added?: number }>("/api/topup/confirm", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  getMySubscription() {
    return request<{ subscription: Subscription | null; role?: string }>("/api/subscription/me");
  },

  getSubscriptions(params: { page: number; limit: number }) {
    const q = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
    return request<{ subscriptions: Subscription[] }>(`/api/subscription?${q}`);
  },

  createSubscription(planId: string, expiresAt?: string) {
    return request<{ subscription: Subscription; remaining_balance?: number }>("/api/subscription", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, expires_at: expiresAt }),
    });
  },
};
