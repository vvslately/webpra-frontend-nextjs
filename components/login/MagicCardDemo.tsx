"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MagicCard } from "@/components/registry/magicui/magic-card"
import { useAuth } from "@/contexts/auth-context"

export function MagicCardDemo() {
  const { theme } = useTheme()
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบล้มเหลว")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl border-none p-0 shadow-none">
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        className="p-0"
      >
        <CardHeader className="border-border border-b px-6 py-3 [.border-b]:pb-3 text-left">
          <CardTitle className="text-left">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="text-left">
            กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-3">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="username">ชื่อผู้ใช้หรืออีเมล</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ชื่อผู้ใช้หรืออีเมล"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-border border-t px-6 py-3 [.border-t]:pt-3">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
          <div className="text-left text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </CardFooter>
      </MagicCard>
    </Card>
  )
}

