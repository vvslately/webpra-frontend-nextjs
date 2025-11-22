"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { apiClient, User } from "@/lib/api"
import { authStorage } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    display_name?: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from storage on mount
  useEffect(() => {
    const storedToken = authStorage.getToken()
    const storedUser = authStorage.getUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      // Verify token is still valid by fetching current user
      refreshUser().catch(() => {
        // If token is invalid, clear auth
        authStorage.clear()
        setToken(null)
        setUser(null)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.data?.user) {
        setUser(response.data.user)
        authStorage.setUser(response.data.user)
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await apiClient.login({ username, password })
      if (response.data) {
        const { user, token } = response.data
        setUser(user)
        setToken(token)
        authStorage.setToken(token)
        authStorage.setUser(user)
      }
    } catch (error) {
      throw error
    }
  }, [])

  const register = useCallback(
    async (data: {
      username: string
      email: string
      password: string
      display_name?: string
      phone?: string
    }) => {
      try {
        const response = await apiClient.register(data)
        if (response.data) {
          const { user, token } = response.data
          setUser(user)
          setToken(token)
          authStorage.setToken(token)
          authStorage.setUser(user)
        }
      } catch (error) {
        throw error
      }
    },
    []
  )

  const logout = useCallback(() => {
    authStorage.clear()
    setUser(null)
    setToken(null)
    router.push("/login")
  }, [router])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

