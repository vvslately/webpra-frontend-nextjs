"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function CreatePostButton() {
  const { isAuthenticated } = useAuth()

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      window.location.href = "/login"
    }
  }

  return (
    <Link
      href={isAuthenticated ? "/post/create" : "/login"}
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <Plus className="h-4 w-4" />
      สร้างโพสต์ใหม่
    </Link>
  )
}

