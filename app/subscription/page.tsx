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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MagicCard } from "@/components/registry/magicui/magic-card";
import { useTheme } from "next-themes";
import { ArrowLeft, Crown, Check, Calendar, AlertCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/board/Alert";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "yearly",
    name: "รายปี",
    price: 599,
    duration: "12 เดือน",
    features: [
      "โพสต์ได้ไม่จำกัด",
      "เข้าถึงฟีเจอร์พิเศษทั้งหมด",
      "ไม่มีโฆษณา",
      "รองรับลูกค้าด่วน",
    ],
  },
];

export default function SubscriptionPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<string>("member");
  const [balance, setBalance] = useState<{ money: number; points: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [planToSubscribe, setPlanToSubscribe] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchCurrentSubscription();
    }
  }, [user, authLoading, router]);

  const fetchCurrentSubscription = async () => {
    setIsLoading(true);
    try {
      const [subscriptionResponse, balanceResponse] = await Promise.all([
        apiClient.getMySubscription(),
        apiClient.getBalance(),
      ]);
      
      if (subscriptionResponse.status === "success" && subscriptionResponse.data) {
        setCurrentSubscription(subscriptionResponse.data.subscription);
        setUserRole(subscriptionResponse.data.role);
      }
      
      if (balanceResponse.status === "success" && balanceResponse.data) {
        setBalance(balanceResponse.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribeClick = (planId: string) => {
    if (!user) return;

    // Check if user already has active subscription
    if (currentSubscription && currentSubscription.status === "active") {
      showAlert({
        title: "คุณมีสมาชิกอยู่แล้ว",
        description: "คุณมีสมาชิกที่ใช้งานอยู่แล้ว",
      });
      return;
    }

    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบแผนที่เลือก",
      });
      return;
    }

    // Check balance
    if (!balance || balance.money < plan.price) {
      const shortage = plan.price - (balance?.money || 0);
      showAlert({
        title: "ยอดเงินไม่พอ",
        description: `ยอดเงินของคุณไม่เพียงพอ ต้องการ ${plan.price.toLocaleString("th-TH")} บาท แต่มี ${(balance?.money || 0).toLocaleString("th-TH")} บาท (ขาด ${shortage.toLocaleString("th-TH")} บาท)`,
      });
      return;
    }

    // Open confirmation dialog
    setPlanToSubscribe(plan);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!planToSubscribe) return;
    
    setConfirmDialogOpen(false);
    await handleSubscribe(planToSubscribe.id);
    setPlanToSubscribe(null);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบแผนที่เลือก",
      });
      return;
    }

    setIsSubscribing(planId);
    try {
      // Calculate expiration date
      const expiresAt = new Date();
      if (planId === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const response = await apiClient.createSubscription(
        planId,
        expiresAt.toISOString()
      );

      if (response.status === "success" && response.data) {
        const remainingBalance = response.data.remaining_balance ?? (balance ? balance.money - plan.price : 0);
        showAlert({
          title: "สำเร็จ",
          description: `สมัครสมาชิก ${plan.name} สำเร็จแล้ว หักเงิน ${plan.price.toLocaleString("th-TH")} บาท ยอดเงินคงเหลือ ${remainingBalance.toLocaleString("th-TH")} บาท`,
        });
        await refreshUser();
        await fetchCurrentSubscription();
        router.push("/subscription/manage");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสมัครสมาชิก";
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
      });
    } finally {
      setIsSubscribing(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "ไม่มีกำหนด";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
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
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <Button variant="ghost" size="icon" asChild className="mb-4">
                  <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Crown className="h-8 w-8" />
                  สมัครสมาชิก
                </h1>
                <p className="text-muted-foreground mt-1">
                  เลือกแผนสมาชิกที่เหมาะกับคุณ
                </p>
              </div>

              {/* Balance Card */}
              {balance && (
                <FadeUp delay={0.05}>
                  <Card className="w-full border-none p-0 shadow-none mb-6">
                    <MagicCard
                      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                      className="p-0"
                    >
                      <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5" />
                          ยอดเงินในบัญชี
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">
                            {balance.money.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-muted-foreground">บาท</span>
                        </div>
                        {subscriptionPlans[0] && balance.money < subscriptionPlans[0].price && (
                          <p className="text-sm text-destructive mt-2">
                            ยอดเงินไม่พอสำหรับสมัครสมาชิก (ต้องการ {subscriptionPlans[0].price.toLocaleString("th-TH")} บาท)
                          </p>
                        )}
                      </CardContent>
                    </MagicCard>
                  </Card>
                </FadeUp>
              )}

              {/* Current Subscription Status */}
              {currentSubscription && currentSubscription.status === "active" && (
                <FadeUp delay={0.1}>
                  <Card className="w-full border-none p-0 shadow-none mb-8">
                    <MagicCard
                      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                      className="p-0 border-primary/50"
                    >
                      <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-primary" />
                          สมาชิกปัจจุบัน
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              แผน {currentSubscription.plan === "yearly" ? "รายปี" : currentSubscription.plan}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>หมดอายุ: {formatDate(currentSubscription.expires_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-sm font-medium">
                              ใช้งานอยู่
                            </span>
                            <Button variant="outline" asChild>
                              <Link href="/subscription/manage">จัดการ</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </MagicCard>
                  </Card>
                </FadeUp>
              )}

              {/* Subscription Plans */}
              <div className="w-full mb-8">
                {subscriptionPlans.map((plan, index) => (
                  <FadeUp key={plan.id} delay={0.1 + index * 0.1}>
                    <Card className="w-full border-none p-0 shadow-none">
                      <MagicCard
                        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                        className="p-0"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1 border-border border-b md:border-b-0 md:border-r px-6 py-4">
                            <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                            <CardDescription className="mb-4">{plan.duration}</CardDescription>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold">
                                {plan.price.toLocaleString("th-TH")}
                              </span>
                              <span className="text-muted-foreground">บาท</span>
                            </div>
                          </div>
                          <div className="md:col-span-1 px-6 py-4 border-border border-b md:border-b-0 md:border-r">
                            <h4 className="font-semibold mb-4">ฟีเจอร์ที่ได้รับ</h4>
                            <ul className="space-y-3">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="md:col-span-1 px-6 py-4 flex flex-col justify-center">
                            <Button
                              className="w-full"
                              size="lg"
                              onClick={() => handleSubscribeClick(plan.id)}
                              disabled={
                                isSubscribing !== null ||
                                (currentSubscription?.status === "active")
                              }
                            >
                              {isSubscribing === plan.id ? (
                                "กำลังสมัคร..."
                              ) : currentSubscription?.status === "active" ? (
                                "มีสมาชิกอยู่แล้ว"
                              ) : (
                                "สมัครสมาชิก"
                              )}
                            </Button>
                          </div>
                        </div>
                      </MagicCard>
                    </Card>
                  </FadeUp>
                ))}
              </div>

              {/* Info Card */}
              <FadeUp delay={0.3}>
                <Card className="w-full border-none p-0 shadow-none">
                  <MagicCard
                    gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                    className="p-0"
                  >
                    <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        ข้อมูลเพิ่มเติม
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• สมาชิกจะหมดอายุอัตโนมัติเมื่อครบกำหนด</li>
                        <li>• การสมัครสมาชิกจะหักเงินจากยอดเงินในบัญชีของคุณ</li>
                        <li>• หากต้องการต่ออายุ กรุณาสมัครใหม่ก่อนวันหมดอายุ</li>
                        <li>• สมาชิกไม่สามารถยกเลิกได้</li>
                      </ul>
                    </CardContent>
                  </MagicCard>
                </Card>
              </FadeUp>
            </div>
          </FadeUp>
        </main>
      </SidebarInset>
      <AlertComponent />

      {/* Confirm Subscription Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              ยืนยันการสมัครสมาชิก
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              {planToSubscribe && (
                <>
                  <div>
                    <p className="font-semibold text-foreground mb-1">แผนที่เลือก:</p>
                    <p>{planToSubscribe.name} ({planToSubscribe.duration})</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">ราคา:</p>
                    <p className="text-lg font-bold text-primary">
                      {planToSubscribe.price.toLocaleString("th-TH")} บาท
                    </p>
                  </div>
                  {balance && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">ยอดเงินปัจจุบัน:</p>
                      <p>{balance.money.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        หลังหักเงินคงเหลือ: {(balance.money - planToSubscribe.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      คุณแน่ใจหรือไม่ว่าต้องการสมัครสมาชิก? ระบบจะหักเงินจากยอดเงินในบัญชีของคุณทันที
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubscribing !== null}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubscribe}
              disabled={isSubscribing !== null}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubscribing !== null ? "กำลังสมัคร..." : "ยืนยันการสมัคร"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

