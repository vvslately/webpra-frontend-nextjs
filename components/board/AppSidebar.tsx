"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, FileText, Heart, MessagesSquare, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "หน้าแรก",
    url: "/",
    icon: Home,
  },
  {
    title: "โพสของคุณ",
    url: "/my-posts",
    icon: FileText,
  },
  {
    title: "โพสต์ที่ฉันถูกใจ",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "ข้อความ",
    url: "/messages",
    icon: MessagesSquare,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isOwner = user && user.role === "owner"

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-start gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold truncate">เว็บบอร์ด</span>
            <span className="text-[10px] text-muted-foreground truncate">ชุมชนถาม-ตอบ</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <Icon className="shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isOwner && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">จัดการระบบ</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin/config"}
                    tooltip="ตั้งค่า Config"
                  >
                    <Link href="/admin/config">
                      <Settings className="shrink-0" />
                      <span className="truncate">ตั้งค่า Config</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

