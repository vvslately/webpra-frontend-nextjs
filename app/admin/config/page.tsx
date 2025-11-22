"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, AppConfig, UpdateConfigRequest } from "@/lib/api";
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
import { ArrowLeft, Settings, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/board/Alert";
import { Switch } from "@/components/ui/switch";

export default function AdminConfigPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [formData, setFormData] = useState<UpdateConfigRequest>({
    promptpay_number: "",
    promptpay_name: "",
    point_topup_enabled: false,
    point_topup_percent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is owner
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.role !== "owner") {
      router.push("/");
      showAlert({
        title: "ไม่มีสิทธิ์",
        description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Owner)",
      });
    }
  }, [user, authLoading, router]);

  // Fetch config
  useEffect(() => {
      const fetchConfig = async () => {
      if (!user || user.role !== "owner") return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getConfig();
        if (response.status === "success" && response.data) {
          const configData = response.data.config;
          setConfig(configData);
          setFormData({
            promptpay_number: configData.promptpay_number || "",
            promptpay_name: configData.promptpay_name || "",
            point_topup_enabled: configData.point_topup_enabled,
            point_topup_percent: configData.point_topup_percent,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลด config");
        console.error("Error fetching config:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === "owner") {
      fetchConfig();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate point_topup_percent
      if (
        formData.point_topup_percent !== undefined &&
        (isNaN(formData.point_topup_percent) ||
          formData.point_topup_percent < 0 ||
          formData.point_topup_percent > 100)
      ) {
        showAlert({
          title: "เกิดข้อผิดพลาด",
          description: "เปอร์เซ็นต์ต้องอยู่ระหว่าง 0 ถึง 100",
        });
        return;
      }

      const response = await apiClient.updateConfig(formData);
      if (response.status === "success" && response.data) {
        setConfig(response.data.config);
        showAlert({
          title: "สำเร็จ",
          description: "อัปเดต config เรียบร้อยแล้ว",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปเดต config";
      setError(errorMessage);
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
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

  if (!user || user.role !== "owner") {
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
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Settings className="h-8 w-8 text-primary" />
                  ตั้งค่า Config
                </h2>
                <p className="text-muted-foreground mt-1">
                  จัดการการตั้งค่าระบบ (เฉพาะ Admin)
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-lg border border-destructive bg-destructive/10 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-1">เกิดข้อผิดพลาด</h3>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              )}

              {/* Config Form */}
              <Card className="w-full border-none p-0 shadow-none">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <form onSubmit={handleSubmit}>
                    <CardHeader className="border-border border-b px-8 py-4 [.border-b]:pb-4 text-left">
                      <CardTitle className="text-left">การตั้งค่า Config</CardTitle>
                      <CardDescription className="text-left">
                        จัดการการตั้งค่าระบบและพารามิเตอร์ต่างๆ
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-4 space-y-6">
                      {/* PromptPay Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">ตั้งค่า PromptPay</h3>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="promptpay_number">หมายเลข PromptPay</Label>
                          <Input
                            id="promptpay_number"
                            type="text"
                            placeholder="080-xxx-xxxx"
                            value={formData.promptpay_number || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, promptpay_number: e.target.value })
                            }
                            disabled={isSaving}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="promptpay_name">ชื่อบัญชี PromptPay</Label>
                          <Input
                            id="promptpay_name"
                            type="text"
                            placeholder="ชื่อบัญชี"
                            value={formData.promptpay_name || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, promptpay_name: e.target.value })
                            }
                            disabled={isSaving}
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        {/* Point Top-up Settings */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">ตั้งค่าระบบ Point Top-up</h3>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="point_topup_enabled">เปิดใช้งาน Point Top-up</Label>
                              <p className="text-sm text-muted-foreground">
                                อนุญาตให้ผู้ใช้เติมเงินผ่านระบบ Point
                              </p>
                            </div>
                            <Switch
                              id="point_topup_enabled"
                              checked={formData.point_topup_enabled || false}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, point_topup_enabled: checked })
                              }
                              disabled={isSaving}
                            />
                          </div>

                          {formData.point_topup_enabled && (
                            <div className="grid gap-2">
                              <Label htmlFor="point_topup_percent">เปอร์เซ็นต์ Point Top-up (%)</Label>
                              <Input
                                id="point_topup_percent"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.point_topup_percent || 0}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    point_topup_percent: parseFloat(e.target.value) || 0,
                                  })
                                }
                                disabled={isSaving}
                              />
                              <p className="text-xs text-muted-foreground">
                                เปอร์เซ็นต์ที่จะได้รับเมื่อเติมเงิน (0-100)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-3 border-border border-t px-8 py-4 [.border-t]:pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSaving}
                      >
                        {isSaving ? (
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
            </div>
            <AlertComponent />
          </FadeUp>
        </main>
      </SidebarInset>
    </div>
  );
}

