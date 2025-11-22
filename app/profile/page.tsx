"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, UpdateProfileRequest, ChangePasswordRequest } from "@/lib/api";
import Header from "@/components/board/Header";
import { AppSidebar } from "@/components/board/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { FadeUp } from "@/components/animations/FadeUp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/registry/magicui/magic-card";
import { useTheme } from "next-themes";
import { ArrowLeft, Upload, User as UserIcon, Mail, Phone, Lock, Save, X } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/board/Alert";

export default function ProfilePage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    display_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  } as any);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setProfileData({
        display_name: user.display_name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar_url: user.avatar_url || "",
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user, authLoading, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const response = await apiClient.updateProfile(profileData);
      if (response.status === "success" && response.data) {
        // Update user in context
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        await refreshUser();
        showAlert({
          title: "สำเร็จ",
          description: "อัปเดตโปรไฟล์เรียบร้อยแล้ว",
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== (passwordData as any).confirm_password) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await apiClient.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      if (response.status === "success") {
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        } as any);
        showAlert({
          title: "สำเร็จ",
          description: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    setIsUploadingAvatar(true);
    try {
      const response = await apiClient.uploadAvatar(file);
      if (response.status === "success" && response.data) {
        await refreshUser();
        showAlert({
          title: "สำเร็จ",
          description: "อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว",
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์",
      });
      // Reset preview on error
      setAvatarPreview(user?.avatar_url || null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </main>
        </SidebarInset>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          <FadeUp>
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  กลับไปหน้าแรก
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">จัดการโปรไฟล์</h2>
                <p className="text-muted-foreground mt-1">
                  แก้ไขข้อมูลส่วนตัวและตั้งค่าบัญชีของคุณ
                </p>
              </div>

              {/* Profile Information */}
              <Card className="w-full border-none p-0 shadow-none mb-6">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <form onSubmit={handleProfileUpdate}>
                    <CardHeader className="border-border border-b px-8 py-4 [.border-b]:pb-4 text-left">
                      <CardTitle className="text-left">ข้อมูลส่วนตัว</CardTitle>
                      <CardDescription className="text-left">
                        แก้ไขข้อมูลส่วนตัวของคุณ
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-4 space-y-4">
                      {/* Avatar Upload */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          {isUploadingAvatar && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="rounded-full bg-background p-2">
                                <svg
                                  className="h-6 w-6 text-primary animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarSelect}
                            className="hidden"
                            disabled={isUploadingAvatar}
                            id="avatar-upload"
                          />
                          <label htmlFor="avatar-upload">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUploadingAvatar}
                              className="cursor-pointer"
                              asChild
                            >
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                {isUploadingAvatar ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
                              </span>
                            </Button>
                          </label>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF (สูงสุด 10MB)
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="display_name">
                          <UserIcon className="h-4 w-4 inline mr-2" />
                          ชื่อที่แสดง
                        </Label>
                        <Input
                          id="display_name"
                          type="text"
                          placeholder="ชื่อที่แสดง"
                          value={profileData.display_name || ""}
                          onChange={(e) =>
                            setProfileData({ ...profileData, display_name: e.target.value })
                          }
                          disabled={isUpdatingProfile}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">
                          <Mail className="h-4 w-4 inline mr-2" />
                          อีเมล *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="อีเมล"
                          value={profileData.email || ""}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          required
                          disabled={isUpdatingProfile}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone">
                          <Phone className="h-4 w-4 inline mr-2" />
                          เบอร์โทรศัพท์
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="เบอร์โทรศัพท์"
                          value={profileData.phone || ""}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          disabled={isUpdatingProfile}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3 border-border border-t px-8 py-4 [.border-t]:pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            กำลังบันทึก...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            บันทึก
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </MagicCard>
              </Card>

              {/* Change Password */}
              <Card className="w-full border-none p-0 shadow-none">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <form onSubmit={handlePasswordChange}>
                    <CardHeader className="border-border border-b px-8 py-4 [.border-b]:pb-4 text-left">
                      <CardTitle className="text-left flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        เปลี่ยนรหัสผ่าน
                      </CardTitle>
                      <CardDescription className="text-left">
                        เปลี่ยนรหัสผ่านของบัญชีคุณ
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-4 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current_password">รหัสผ่านปัจจุบัน *</Label>
                        <Input
                          id="current_password"
                          type="password"
                          placeholder="รหัสผ่านปัจจุบัน"
                          value={passwordData.current_password}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, current_password: e.target.value })
                          }
                          required
                          disabled={isChangingPassword}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="new_password">รหัสผ่านใหม่ *</Label>
                        <Input
                          id="new_password"
                          type="password"
                          placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                          value={passwordData.new_password}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, new_password: e.target.value })
                          }
                          required
                          disabled={isChangingPassword}
                          minLength={6}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่ *</Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          placeholder="ยืนยันรหัสผ่านใหม่"
                          value={(passwordData as any).confirm_password || ""}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirm_password: e.target.value,
                            } as any)
                          }
                          required
                          disabled={isChangingPassword}
                          minLength={6}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3 border-border border-t px-8 py-4 [.border-t]:pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            กำลังเปลี่ยน...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            เปลี่ยนรหัสผ่าน
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </MagicCard>
              </Card>
            </div>
            <AlertComponent />
          </FadeUp>
        </main>
      </SidebarInset>
    </div>
  );
}

