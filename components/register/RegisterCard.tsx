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

export function RegisterCard() {
  const { theme } = useTheme()
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    display_name: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }

    setIsLoading(true)

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        display_name: formData.display_name || undefined,
        phone: formData.phone || undefined,
      })
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "การสมัครสมาชิกล้มเหลว")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-xl border-none p-0 shadow-none">
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        className="p-0"
      >
        <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
          <CardTitle>สมัครสมาชิก</CardTitle>
          <CardDescription>
            กรุณากรอกข้อมูลเพื่อสร้างบัญชีใหม่
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ชื่อผู้ใช้"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="อีเมลของคุณ"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_name">ชื่อที่แสดง</Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="ชื่อที่แสดง (ไม่บังคับ)"
                  value={formData.display_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="เบอร์โทรศัพท์ (ไม่บังคับ)"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">รหัสผ่าน *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="ยืนยันรหัสผ่านของคุณ"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-border border-t px-6 py-4 [.border-t]:pt-4">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </CardFooter>
      </MagicCard>
    </Card>
  )
}

