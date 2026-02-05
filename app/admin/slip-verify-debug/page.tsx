"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileImage, Code, AlertCircle, CheckCircle } from "lucide-react";

type SlipVerifyResponse = {
  code?: number;
  message?: string;
  [key: string]: any;
};

const ERROR_CODES: Record<number, string> = {
  1000: "Missing headers (Authorization or Content-Type)",
  1001: "Invalid authorization header",
  1002: "Invalid authorization header",
  1003: "IP not whitelisted",
  1004: "Invalid payload",
  1005: "Invalid payload",
  1006: "Invalid payload",
  1007: "Usage exceeded",
  1008: "Subscription expired",
  2001: "Internal error 1",
  2002: "Bank API Error",
  2003: "Bank API Error",
  2004: "Bank API Error",
  2005: "Internal error 2",
  2006: "Bank API return no data",
};

export default function SlipVerifyDebugPage() {
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipPayload, setSlipPayload] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [response, setResponse] = useState<SlipVerifyResponse | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [requestMethod, setRequestMethod] = useState<"file" | "json" | "raw" | null>(null);

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, JPG, PNG)");
        return;
      }
      setSlipFile(file);
      setResponse(null);
      setResponseStatus(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifySlip = async (method: "file" | "json" | "raw") => {
    setIsVerifying(true);
    setResponse(null);
    setResponseStatus(null);
    setRequestMethod(method);

    try {
      let fetchResponse: Response;
      let responseData: SlipVerifyResponse;

      if (method === "file" && slipFile) {
        const formData = new FormData();
        formData.append("file", slipFile);
        fetchResponse = await fetch("/api/slip-verify/inquiry", {
          method: "POST",
          body: formData,
        });
        responseData = await fetchResponse.json();
      } else if (method === "json" && slipPayload) {
        fetchResponse = await fetch("/api/slip-verify/inquiry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload: slipPayload }),
        });
        responseData = await fetchResponse.json();
      } else if (method === "raw" && slipFile) {
        fetchResponse = await fetch("/api/slip-verify/inquiry", {
          method: "POST",
          headers: {
            "Content-Type": slipFile.type,
          },
          body: slipFile,
        });
        responseData = await fetchResponse.json();
      } else {
        alert("กรุณาเลือกไฟล์หรือระบุ payload");
        setIsVerifying(false);
        return;
      }

      setResponseStatus(fetchResponse.status);
      setResponse(responseData);
    } catch (err) {
      setResponse({
        code: 2001,
        message: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
      });
      setResponseStatus(500);
    } finally {
      setIsVerifying(false);
    }
  };

  const getErrorDescription = (code?: number) => {
    if (!code) return null;
    return ERROR_CODES[code] || "Unknown error";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Slip Verify Debug</h1>
        <p className="text-muted-foreground">
          หน้าดีบักสำหรับทดสอบ Slip Verify API และดู Response
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>เลือกวิธีการส่งข้อมูล</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {/* JSON Payload Input */}
            <div>
              <Label htmlFor="slip-payload">หรือระบุ Payload (JSON)</Label>
              <Input
                id="slip-payload"
                type="text"
                value={slipPayload}
                onChange={(e) => setSlipPayload(e.target.value)}
                placeholder="เช่น 1231"
                className="mt-2"
              />
            </div>

            {/* Verify Buttons */}
            <div className="space-y-2">
              {slipFile && (
                <>
                  <Button
                    onClick={() => handleVerifySlip("file")}
                    className="w-full"
                    disabled={isVerifying}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isVerifying && requestMethod === "file"
                      ? "กำลังตรวจสอบ..."
                      : "ตรวจสอบ (Multipart Form)"}
                  </Button>
                  <Button
                    onClick={() => handleVerifySlip("raw")}
                    variant="outline"
                    className="w-full"
                    disabled={isVerifying}
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    {isVerifying && requestMethod === "raw"
                      ? "กำลังตรวจสอบ..."
                      : "ตรวจสอบ (Raw Image)"}
                  </Button>
                </>
              )}
              {slipPayload && (
                <Button
                  onClick={() => handleVerifySlip("json")}
                  variant="outline"
                  className="w-full"
                  disabled={isVerifying}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {isVerifying && requestMethod === "json"
                    ? "กำลังตรวจสอบ..."
                    : "ตรวจสอบ (JSON Payload)"}
                </Button>
              )}
            </div>

            {/* Clear Button */}
            {(slipFile || slipPayload || response) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSlipFile(null);
                  setSlipPreview(null);
                  setSlipPayload("");
                  setResponse(null);
                  setResponseStatus(null);
                  setRequestMethod(null);
                }}
                className="w-full"
              >
                ล้างข้อมูล
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Response Section */}
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>ผลลัพธ์จาก Slip Verify API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerifying ? (
              <div className="text-center py-8 text-muted-foreground">
                กำลังตรวจสอบ...
              </div>
            ) : response ? (
              <>
                {/* Status Code */}
                {responseStatus && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    {responseStatus >= 200 && responseStatus < 300 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">HTTP Status: {responseStatus}</p>
                      {responseStatus >= 400 && (
                        <p className="text-xs text-muted-foreground">
                          {responseStatus === 400 ? "Bad Request" : "Error"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Code */}
                {response.code && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          Error Code: {response.code}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {getErrorDescription(response.code)}
                        </p>
                        {response.message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Message: {response.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {!response.code && responseStatus && responseStatus < 400 && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          สำเร็จ
                        </p>
                        {response.message && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {response.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Response JSON */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Full Response JSON:
                  </Label>
                  <div className="p-4 bg-muted rounded-lg overflow-auto max-h-96">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Request Method */}
                {requestMethod && (
                  <div className="text-xs text-muted-foreground">
                    Request Method: {requestMethod}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                ยังไม่มีการตรวจสอบสลิป
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Codes Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Error Codes Reference</CardTitle>
          <CardDescription>รายการ Error Code ที่ API อาจส่งกลับมา</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ERROR_CODES).map(([code, description]) => (
              <div
                key={code}
                className="p-3 border rounded-lg bg-muted/50"
              >
                <p className="text-sm font-semibold">Code: {code}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
