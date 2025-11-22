import { MagicCardDemo } from "@/components/login/MagicCardDemo"
import { AppSidebar } from "@/components/board/AppSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import Header from "@/components/board/Header"
import { FadeUp } from "@/components/animations/FadeUp"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <FadeUp>
            <MagicCardDemo />
          </FadeUp>
        </div>
      </SidebarInset>
    </div>
  )
}

