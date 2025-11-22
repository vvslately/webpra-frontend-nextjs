export const AUTH_TOKEN_KEY = "token"
export const AUTH_USER_KEY = "user"

export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  },

  removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_TOKEN_KEY)
  },

  getUser(): any | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem(AUTH_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  setUser(user: any): void {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_USER_KEY)
  },

  clear(): void {
    this.removeToken()
    this.removeUser()
  },
}

