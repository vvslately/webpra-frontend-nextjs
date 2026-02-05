"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, X, Upload, FileImage, Loader2 } from "lucide-react";

type SlipAccount = {
  id: number;
  account_number: string;
  account_full: string | null;
  receiver_name: string;
  display_name: string | null;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function SlipAccountsPage() {
  const [accounts, setAccounts] = useState<SlipAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<SlipAccount>>({
    account_number: "",
    account_full: "",
    receiver_name: "",
    display_name: "",
    full_name: "",
    is_active: true,
  });
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/slip-accounts");
      const data = await response.json();
      if (data.status === "success") {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/slip-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === "success") {
        setIsCreating(false);
        setFormData({
          account_number: "",
          account_full: "",
          receiver_name: "",
          display_name: "",
          full_name: "",
          is_active: true,
        });
        fetchAccounts();
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้าง");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/slip-accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === "success") {
        setEditingId(null);
        setFormData({
          account_number: "",
          account_full: "",
          receiver_name: "",
          display_name: "",
          full_name: "",
          is_active: true,
        });
        fetchAccounts();
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ?")) return;

    try {
      const response = await fetch(`/api/admin/slip-accounts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.status === "success") {
        fetchAccounts();
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const startEdit = (account: SlipAccount) => {
    setEditingId(account.id);
    setFormData({
      account_number: account.account_full || account.account_number,
      account_full: account.account_full || "",
      receiver_name: account.receiver_name,
      display_name: account.display_name || "",
      full_name: account.full_name || "",
      is_active: account.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setSlipFile(null);
    setSlipPreview(null);
    setFormData({
      account_number: "",
      account_full: "",
      receiver_name: "",
      display_name: "",
      full_name: "",
      is_active: true,
    });
  };

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, JPG, PNG)");
        return;
      }
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipFile) {
      alert("กรุณาเลือกไฟล์สลิป");
      return;
    }

    setIsUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append("file", slipFile);

      const response = await fetch("/api/slip-verify/inquiry", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok && responseData.valid && responseData.data) {
        const data = responseData.data;
        const receiverAccount = data.receiver?.account?.value || "";
        
        // Extract last 4 digits
        const digits = receiverAccount.replace(/\D/g, "");
        const last4Digits = digits.slice(-4);

        // Auto-fill form data
        setFormData({
          account_number: receiverAccount, // Full account number
          account_full: receiverAccount,
          receiver_name: data.receiver?.name || "",
          display_name: data.receiver?.displayName || "",
          full_name: data.receiver?.displayName || data.receiver?.name || "",
          is_active: true,
        });

        alert("โหลดข้อมูลจากสลิปสำเร็จ กรุณาตรวจสอบและบันทึก");
      } else {
        alert(
          responseData.message || `เกิดข้อผิดพลาด: ${responseData.code || "Unknown"}`
        );
      }
    } catch (error) {
      console.error("Error uploading slip:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดสลิป");
    } finally {
      setIsUploadingSlip(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2d1b4e]">จัดการบัญชีสลิป</h1>
          <p className="text-muted-foreground mt-1">
            จัดการบัญชีสำหรับตรวจสอบสลิปการเติมเงิน
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#6b5b7a] hover:bg-[#5a4b6a]"
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มบัญชี
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มบัญชีใหม่</CardTitle>
            <CardDescription>
              อัปโหลดสลิปเพื่อตั้งค่าอัตโนมัติ หรือกรอกข้อมูลด้วยตนเอง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Slip Upload Section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <Label className="text-sm font-semibold mb-2 block">
                อัปโหลดสลิปเพื่อตั้งค่าอัตโนมัติ
              </Label>
              <div className="space-y-3">
                <div>
                  <input
                    id="slip-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleSlipFileChange}
                    className="hidden"
                  />
                  <label htmlFor="slip-upload">
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
                {slipFile && (
                  <Button
                    onClick={handleUploadSlip}
                    disabled={isUploadingSlip}
                    className="w-full"
                    variant="outline"
                  >
                    {isUploadingSlip ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังตรวจสอบสลิป...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        ตรวจสอบสลิปและโหลดข้อมูล
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create_account_number">เลขบัญชี (เต็ม)</Label>
                <Input
                  id="create_account_number"
                  value={formData.account_number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="เช่น xxx-x-x2409-x หรือ 1234567890"
                />
              </div>
              <div>
                <Label htmlFor="create_account_full">เลขบัญชีเต็ม (เก็บไว้)</Label>
                <Input
                  id="create_account_full"
                  value={formData.account_full || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, account_full: e.target.value })
                  }
                  placeholder="เลขบัญชีเต็ม"
                />
              </div>
              <div>
                <Label htmlFor="create_receiver_name">Receiver Name</Label>
                <Input
                  id="create_receiver_name"
                  value={formData.receiver_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, receiver_name: e.target.value })
                  }
                  placeholder="ชื่อจากสลิป"
                  required
                />
              </div>
              <div>
                <Label htmlFor="create_display_name">Display Name</Label>
                <Input
                  id="create_display_name"
                  value={formData.display_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  placeholder="ชื่อที่แสดง"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="create_full_name">Full Name</Label>
                <Input
                  id="create_full_name"
                  value={formData.full_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="ชื่อเต็มสำหรับแสดงในหน้าเติมเงิน"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-[#6b5b7a] hover:bg-[#5a4b6a]">
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการบัญชี</CardTitle>
          <CardDescription>ทั้งหมด {accounts.length} บัญชี</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">เลขบัญชี (4 หลัก)</th>
                  <th className="text-left p-3">เลขบัญชีเต็ม</th>
                  <th className="text-left p-3">Receiver Name</th>
                  <th className="text-left p-3">Display Name</th>
                  <th className="text-left p-3">Full Name</th>
                  <th className="text-left p-3">สถานะ</th>
                  <th className="text-left p-3">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      ยังไม่มีบัญชี
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) =>
                    editingId === account.id ? (
                      <tr key={account.id} className="border-b">
                        <td colSpan={7} className="p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>เลขบัญชี (เต็ม)</Label>
                                <Input
                                  value={formData.account_number || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      account_number: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>เลขบัญชีเต็ม (เก็บไว้)</Label>
                                <Input
                                  value={formData.account_full || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      account_full: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Receiver Name</Label>
                                <Input
                                  value={formData.receiver_name || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      receiver_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Display Name</Label>
                                <Input
                                  value={formData.display_name || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      display_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Full Name</Label>
                                <Input
                                  value={formData.full_name || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      full_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>
                                  <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        is_active: e.target.checked,
                                      })
                                    }
                                    className="mr-2"
                                  />
                                  เปิดใช้งาน
                                </Label>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdate(account.id)}
                                className="bg-[#6b5b7a] hover:bg-[#5a4b6a]"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                บันทึก
                              </Button>
                              <Button variant="outline" onClick={cancelEdit}>
                                <X className="h-4 w-4 mr-2" />
                                ยกเลิก
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={account.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono">{account.account_number}</td>
                        <td className="p-3 font-mono text-sm text-muted-foreground">
                          {account.account_full || "-"}
                        </td>
                        <td className="p-3">{account.receiver_name}</td>
                        <td className="p-3">{account.display_name || "-"}</td>
                        <td className="p-3">{account.full_name || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              account.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {account.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(account)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
