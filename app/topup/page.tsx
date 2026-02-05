"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/registry/magicui/magic-card";
import { useTheme } from "next-themes";
import { Wallet, ArrowLeft, Upload, FileImage, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/board/Alert";

type SlipVerifyResponse = {
  code?: number;
  message?: string;
  [key: string]: any;
};

export default function TopupPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false);
  const [slipResponse, setSlipResponse] = useState<SlipVerifyResponse | null>(null);
  const [slipVerificationResult, setSlipVerificationResult] = useState<{
    verified: boolean;
    full_name?: string;
    amount?: number;
    account?: any;
    receiver_account?: string;
    receiver_name?: string;
    trans_ref?: string;
    slip_data?: any;
  } | null>(null);
  const [isConfirmingSlip, setIsConfirmingSlip] = useState(false);
  const [slipAccounts, setSlipAccounts] = useState<Array<{
    id: number;
    account_number: string;
    account_full: string | null;
    receiver_name: string;
    display_name: string | null;
    full_name: string | null;
  }>>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchSlipAccounts();
    }
  }, [user, authLoading, router]);

  const fetchSlipAccounts = async () => {
    try {
      const response = await fetch("/api/topup/slip-accounts", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Error fetching slip accounts:", response.status, response.statusText);
        // Set empty array to prevent UI errors
        setSlipAccounts([]);
        return;
      }
      
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setSlipAccounts(data.data);
      } else {
        setSlipAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching slip accounts:", error);
      // Set empty array to prevent UI errors
      setSlipAccounts([]);
    }
  };

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        showAlert({
          title: "เกิดข้อผิดพลาด",
          description: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, JPG, PNG)",
        });
        return;
      }
      setSlipFile(file);
      setSlipResponse(null);
      setSlipVerificationResult(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifySlip = async () => {
    if (!slipFile) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาเลือกไฟล์สลิป",
      });
      return;
    }

    setIsVerifyingSlip(true);
    setSlipResponse(null);
    setSlipVerificationResult(null);

    try {
      // Multipart form data
      const formData = new FormData();
      formData.append("file", slipFile);
      const response = await fetch("/api/slip-verify/inquiry", {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();

      setSlipResponse(responseData);

      if (response.ok && !responseData.code && responseData.valid && responseData.data) {
        // Verify slip against our accounts
        const verifyResponse = await fetch("/api/topup/verify-slip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver_account: responseData.data.receiver?.account?.value || "",
            receiver_name: responseData.data.receiver?.name || "",
            amount: responseData.data.amount || 0,
            trans_ref: responseData.data.transRef || responseData.discriminator,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.status === "success" && verifyData.data.verified) {
          setSlipVerificationResult({
            verified: true,
            full_name: verifyData.data.full_name,
            amount: verifyData.data.amount,
            account: verifyData.data.account,
            receiver_account: responseData.data.receiver?.account?.value || "",
            receiver_name: responseData.data.receiver?.name || "",
            trans_ref: responseData.data.transRef || responseData.discriminator,
            slip_data: responseData,
          });
          showAlert({
            title: "สำเร็จ",
            description: `ตรวจสอบสลิปสำเร็จ - ${verifyData.data.full_name || "ไม่ระบุชื่อ"} จำนวน ${verifyData.data.amount?.toLocaleString("th-TH") || "0"} บาท`,
          });
        } else {
          setSlipVerificationResult(null);
          showAlert({
            title: "เกิดข้อผิดพลาด",
            description: verifyData.error || "ไม่พบบัญชีที่ตรงกับสลิป",
          });
        }
      } else {
        setSlipVerificationResult(null);
        showAlert({
          title: "เกิดข้อผิดพลาด",
          description: responseData.message || `Error Code: ${responseData.code}`,
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
      });
    } finally {
      setIsVerifyingSlip(false);
    }
  };

  const handleConfirmSlipTopup = async () => {
    if (!slipVerificationResult || !slipVerificationResult.verified) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาตรวจสอบสลิปก่อน",
      });
      return;
    }

    setIsConfirmingSlip(true);
    try {
      const response = await fetch("/api/topup/confirm-slip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_account: slipVerificationResult.receiver_account,
          receiver_name: slipVerificationResult.receiver_name,
          amount: slipVerificationResult.amount,
          trans_ref: slipVerificationResult.trans_ref,
          slip_data: slipVerificationResult.slip_data,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        showAlert({
          title: "สำเร็จ",
          description: `เติมเงินสำเร็จ ${(data.data.amount_added ?? 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })} บาท ยอดเงินใหม่: ${(data.data.new_balance ?? 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })} บาท`,
        });
        // Reset slip data
        setSlipFile(null);
        setSlipPreview(null);
        setSlipResponse(null);
        setSlipVerificationResult(null);
      } else {
        showAlert({
          title: "เกิดข้อผิดพลาด",
          description: data.error || "เกิดข้อผิดพลาดในการเติมเงิน",
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเติมเงิน",
      });
    } finally {
      setIsConfirmingSlip(false);
    }
  };

  if (!user || authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <p className="text-muted-foreground">อัปโหลดสลิปเพื่อตรวจสอบและเติมเงิน</p>
          </div>
        </div>

        {/* Slip Verify */}
        <Card className="w-full max-w-2xl mx-auto border-none p-0 shadow-none">
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            className="p-0"
          >
            <CardHeader className="border-border border-b px-6 py-4 [.border-b]:pb-4">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                ตรวจสอบสลิป (Slip Verify)
              </CardTitle>
              <CardDescription>
                อัปโหลดสลิปเพื่อตรวจสอบ
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4 space-y-4">
              {/* Account Information */}
              {slipAccounts.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-semibold mb-2">ข้อมูลบัญชีสำหรับเติมเงิน:</p>
                  {slipAccounts.map((account) => (
                    <div key={account.id} className="space-y-1 text-sm">
                      {account.full_name && (
                        <div>
                          <span className="font-medium text-muted-foreground">Full Name: </span>
                          <span className="text-foreground">{account.full_name}</span>
                        </div>
                      )}
                      {account.account_full && (
                        <div>
                          <span className="font-medium text-muted-foreground">Account Value: </span>
                          <span className="font-mono text-foreground">{account.account_full}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* File Upload */}
              <div>
                <Label htmlFor="slip-file">อัปโหลดสลิป</Label>
                <div className="mt-2">
                  <input
                    id="slip-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleSlipFileChange}
                    className="hidden"
                  />
                  <label htmlFor="slip-file">
                    <div className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      {slipPreview ? (
                        <div className="space-y-2">
                          <img
                            src={slipPreview}
                            alt="Slip preview"
                            className="w-full h-48 object-contain rounded"
                          />
                          <p className="text-sm text-center text-muted-foreground">
                            {slipFile?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            คลิกเพื่อเลือกไฟล์สลิป
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            รองรับไฟล์ JPEG, JPG, PNG
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Verify Button */}
              {slipFile && (
                <Button
                  onClick={handleVerifySlip}
                  className="w-full"
                  disabled={isVerifyingSlip}
                >
                  {isVerifyingSlip ? "กำลังตรวจสอบ..." : "ตรวจสอบสลิป"}
                </Button>
              )}

              {/* Verification Result */}
              {slipVerificationResult && slipVerificationResult.verified && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                          ตรวจสอบสลิปสำเร็จ
                        </p>
                        {slipVerificationResult.full_name && (
                          <div>
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">
                              Full Name:
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {slipVerificationResult.full_name}
                            </p>
                          </div>
                        )}
                        {slipVerificationResult.receiver_account && (
                          <div>
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">
                              Account Value:
                            </p>
                            <p className="text-sm font-mono text-green-600 dark:text-green-400">
                              {slipVerificationResult.receiver_account}
                            </p>
                          </div>
                        )}
                        {slipVerificationResult.amount && (
                          <div>
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">
                              จำนวนเงิน:
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {slipVerificationResult.amount.toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              บาท
                            </p>
                          </div>
                        )}
                        {slipVerificationResult.account && (
                          <div>
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">
                              บัญชี (4 หลัก):
                            </p>
                            <p className="text-xs font-mono text-green-600 dark:text-green-400">
                              {slipVerificationResult.account.account_number}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleConfirmSlipTopup}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isConfirmingSlip}
                  >
                    {isConfirmingSlip ? (
                      "กำลังเติมเงิน..."
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ยืนยันเติมเงิน{" "}
                        {slipVerificationResult.amount
                          ? `${slipVerificationResult.amount.toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                            })} บาท`
                          : ""}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Clear Button */}
              {(slipFile || slipResponse) && !slipVerificationResult?.verified && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSlipFile(null);
                    setSlipPreview(null);
                    setSlipResponse(null);
                    setSlipVerificationResult(null);
                  }}
                  className="w-full"
                >
                  ล้างข้อมูล
                </Button>
              )}
            </CardContent>
          </MagicCard>
        </Card>
      </div>
      <AlertComponent />
    </div>
  );
}
