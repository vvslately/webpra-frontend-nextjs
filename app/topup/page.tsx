"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, PromptPayQRCode, Topup } from "@/lib/api";
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
import { Wallet, QrCode, CheckCircle, XCircle, ArrowLeft, RefreshCw, History } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/board/Alert";

export default function TopupPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  const [balance, setBalance] = useState<{ money: number; points: number } | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [qrCode, setQrCode] = useState<PromptPayQRCode | null>(null);
  const [topupHistory, setTopupHistory] = useState<Topup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingQR, setIsCreatingQR] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchBalance();
      fetchTopupHistory();
    }
  }, [user, authLoading, router]);

  const fetchBalance = async () => {
    try {
      const response = await apiClient.getBalance();
      if (response.status === "success" && response.data) {
        setBalance(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const fetchTopupHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await apiClient.getTopupHistory({ page: 1, limit: 10 });
      if (response.status === "success" && response.data) {
        setTopupHistory(response.data.topups);
      }
    } catch (err) {
      console.error("Failed to fetch topup history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาระบุจำนวนเงินที่ถูกต้อง (ต้องเป็นตัวเลขที่มากกว่า 0)",
      });
      return;
    }

    setIsCreatingQR(true);
    try {
      const response = await apiClient.createPromptPayQR(numericAmount);
      if (response.status === "success" && response.data) {
        // Backend returns data directly, not nested
        setQrCode(response.data as PromptPayQRCode);
        showAlert({
          title: "สำเร็จ",
          description: "สร้าง QR Code สำเร็จแล้ว กรุณาสแกนเพื่อเติมเงิน",
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้าง QR Code",
      });
    } finally {
      setIsCreatingQR(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!qrCode) return;

    setIsConfirming(true);
    try {
      const response = await apiClient.confirmPromptPayPayment(qrCode.amount);
      if (response.status === "success" && response.data) {
        showAlert({
          title: "สำเร็จ",
          description: `เติมเงินสำเร็จ ${response.data.amount_added.toLocaleString("th-TH")} บาท`,
        });
        setQrCode(null);
        setAmount("");
        fetchBalance();
        fetchTopupHistory();
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการยืนยันการเติมเงิน",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!user || authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full">
        <Header />
        <div className="flex-1 p-6 space-y-6">
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Wallet className="h-8 w-8" />
                  เติมเงิน
                </h1>
                <p className="text-muted-foreground">เติมเงินเข้าบัญชีผ่าน PromptPay</p>
              </div>
            </div>
          </FadeUp>

          {/* Balance Card */}
          {balance && (
            <FadeUp delay={0.1}>
              <Card className="w-full border-none p-0 shadow-none">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                    <CardTitle>ยอดเงินในบัญชี</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">ยอดเงิน</p>
                        <p className="text-2xl font-bold">
                          {balance.money.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">คะแนน</p>
                        <p className="text-2xl font-bold">
                          {balance.points.toLocaleString("th-TH")} คะแนน
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-border border-t px-6 py-4 [.border-t]:pt-4">
                    <Button variant="outline" onClick={fetchBalance}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      รีเฟรช
                    </Button>
                  </CardFooter>
                </MagicCard>
              </Card>
            </FadeUp>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create QR Code */}
            <FadeUp delay={0.2}>
              <Card className="w-full border-none p-0 shadow-none">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      สร้าง QR Code สำหรับเติมเงิน
                    </CardTitle>
                    <CardDescription>
                      กรุณาระบุจำนวนเงินที่ต้องการเติม
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    {!qrCode ? (
                      <form onSubmit={handleCreateQR} className="space-y-4">
                        <div>
                          <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="เช่น 100, 500, 1000"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isCreatingQR}>
                          {isCreatingQR ? "กำลังสร้าง..." : "สร้าง QR Code"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">จำนวนเงิน</p>
                          <p className="text-3xl font-bold">
                            {qrCode.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                          </p>
                        </div>
                        {qrCode.qr_image && (
                          <div className="flex justify-center">
                            <img
                              src={qrCode.qr_image}
                              alt="PromptPay QR Code"
                              className="w-64 h-64 border rounded-lg"
                            />
                          </div>
                        )}
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {qrCode.promptpay_name || "PromptPay"}
                          </p>
                          <p className="text-sm font-mono">{qrCode.phone_number}</p>
                          <p className="text-xs text-muted-foreground">
                            กรุณาสแกน QR Code เพื่อเติมเงิน
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleConfirmPayment}
                            className="flex-1"
                            disabled={isConfirming}
                          >
                            {isConfirming ? "กำลังยืนยัน..." : "ยืนยันการเติมเงิน"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setQrCode(null);
                              setAmount("");
                            }}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </MagicCard>
              </Card>
            </FadeUp>

            {/* Topup History */}
            <FadeUp delay={0.3}>
              <Card className="w-full border-none p-0 shadow-none">
                <MagicCard
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                  className="p-0"
                >
                  <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      ประวัติการเติมเงิน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    {isLoadingHistory ? (
                      <div className="text-center py-8 text-muted-foreground">
                        กำลังโหลด...
                      </div>
                    ) : topupHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        ยังไม่มีการเติมเงิน
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topupHistory.map((topup) => (
                          <div
                            key={topup.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {topup.status === "success" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-semibold">
                                  {topup.amount.toLocaleString("th-TH", {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  บาท
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {topup.method} • {formatDate(topup.created_at)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ref: {topup.transaction_ref}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  topup.status === "success"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {topup.status === "success" ? "สำเร็จ" : "ล้มเหลว"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </MagicCard>
              </Card>
            </FadeUp>
          </div>
        </div>
      </SidebarInset>
      <AlertComponent />
    </div>
  );
}

