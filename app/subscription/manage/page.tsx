"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, Subscription } from "@/lib/api";
import Header from "@/components/board/Header";
import { AppSidebar } from "@/components/board/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { FadeUp } from "@/components/animations/FadeUp";
import { Button } from "@/components/ui/button";
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
import {
  ArrowLeft,
  Crown,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/board/Alert";

export default function SubscriptionManagePage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<string>("member");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchSubscriptionData();
    }
  }, [user, authLoading, router]);

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const [currentResponse, allResponse] = await Promise.all([
        apiClient.getMySubscription(),
        apiClient.getSubscriptions({ page: 1, limit: 20 }),
      ]);

      if (currentResponse.status === "success" && currentResponse.data) {
        setCurrentSubscription(currentResponse.data.subscription);
        setUserRole(currentResponse.data.role);
      }

      if (allResponse.status === "success" && allResponse.data) {
        setSubscriptions(allResponse.data.subscriptions);
      }
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
    } finally {
      setIsLoading(false);
    }
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return "ไม่มีกำหนด";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-sm font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            ใช้งานอยู่
          </span>
        );
      case "expired":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" />
            หมดอายุ
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ยกเลิกแล้ว
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const getPlanName = (plan: string) => {
    return plan === "monthly" ? "รายเดือน" : plan === "yearly" ? "รายปี" : plan;
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          <FadeUp>
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/subscription">
                      <ArrowLeft className="h-5 w-5" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                      <Crown className="h-8 w-8" />
                      จัดการสมาชิก
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      ดูและจัดการสมาชิกของคุณ
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Subscription */}
              {currentSubscription ? (
                <FadeUp delay={0.1}>
                  <Card className="w-full border-none p-0 shadow-none mb-6">
                    <MagicCard
                      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                      className="p-0"
                    >
                      <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Crown className="h-5 w-5 text-primary" />
                              สมาชิกปัจจุบัน
                            </CardTitle>
                            <CardDescription className="mt-1">
                              แผน {getPlanName(currentSubscription.plan)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(currentSubscription.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 py-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">วันที่เริ่มต้น</p>
                            <p className="font-medium">
                              {formatDate(currentSubscription.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">วันหมดอายุ</p>
                            <p className="font-medium">
                              {formatDate(currentSubscription.expires_at)}
                            </p>
                          </div>
                          {currentSubscription.cancelled_at && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">ยกเลิกเมื่อ</p>
                              <p className="font-medium">
                                {formatDate(currentSubscription.cancelled_at)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">สถานะ</p>
                            <p className="font-medium capitalize">{currentSubscription.status}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              สมาชิกไม่สามารถยกเลิกได้
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </MagicCard>
                  </Card>
                </FadeUp>
              ) : (
                <FadeUp delay={0.1}>
                  <Card className="w-full border-none p-0 shadow-none mb-6">
                    <MagicCard
                      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                      className="p-0"
                    >
                      <CardContent className="px-6 py-8 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">คุณยังไม่มีสมาชิก</h3>
                        <p className="text-muted-foreground mb-4">
                          สมัครสมาชิกเพื่อเข้าถึงฟีเจอร์พิเศษทั้งหมด
                        </p>
                        <Button asChild>
                          <Link href="/subscription">สมัครสมาชิก</Link>
                        </Button>
                      </CardContent>
                    </MagicCard>
                  </Card>
                </FadeUp>
              )}

              {/* Subscription History */}
              {subscriptions.length > 0 && (
                <FadeUp delay={0.2}>
                  <Card className="w-full border-none p-0 shadow-none">
                    <MagicCard
                      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                      className="p-0"
                    >
                      <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle>ประวัติสมาชิก</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchSubscriptionData}
                            disabled={isLoading}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            รีเฟรช
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 py-4">
                        <div className="space-y-4">
                          {subscriptions.map((subscription) => (
                            <div
                              key={subscription.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold">
                                    แผน {getPlanName(subscription.plan)}
                                  </span>
                                  {getStatusBadge(subscription.status)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">เริ่มต้น:</span>{" "}
                                    {formatDate(subscription.created_at)}
                                  </div>
                                  <div>
                                    <span className="font-medium">หมดอายุ:</span>{" "}
                                    {formatDate(subscription.expires_at)}
                                  </div>
                                  {subscription.cancelled_at && (
                                    <div>
                                      <span className="font-medium">ยกเลิก:</span>{" "}
                                      {formatDate(subscription.cancelled_at)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </MagicCard>
                  </Card>
                </FadeUp>
              )}
            </div>
          </FadeUp>
        </main>
      </SidebarInset>
      <AlertComponent />
    </div>
  );
}

