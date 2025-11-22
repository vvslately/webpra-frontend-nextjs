"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RegisterCard } from "@/components/register/RegisterCard"
import { AppSidebar } from "@/components/board/AppSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import Header from "@/components/board/Header"
import { FadeUp } from "@/components/animations/FadeUp"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Allow anyone to access register page - no redirect
  // Users can register even if they're already logged in

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <FadeUp>
            <RegisterCard />
          </FadeUp>
        </div>
      </SidebarInset>
    </div>
  )
}

