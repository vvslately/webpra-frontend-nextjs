import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

const PICINTH_UPLOAD_URL = "https://pic.in.th/api/1/upload";

export async function POST(request: Request) {
  const err = await requireAdminApi();
  if (err) return err;

  const apiKey =
    process.env.PICINTH_API_KEY ??
    "chv_GGjT_c64bb4fb2eafab2f3f295ca156fcd45c3409afd98c693dec5ad53aeebb309b0a_92c819735dfbaaf45627c71b530fc794f329d990b9bfd955ef5c7a8af9c52d22";

  try {
    const formData = await request.formData();
    const file = formData.get("source") ?? formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "กรุณาส่งไฟล์รูป (field: source หรือ file)" },
        { status: 400 }
      );
    }

    const body = new FormData();
    body.append("source", file);
    body.append("format", "json");

    const res = await fetch(PICINTH_UPLOAD_URL, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    const statusCode = data?.status_code ?? data?.success?.code ?? res.status;

    if (statusCode !== 200 || !data?.image?.url) {
      const msg =
        data?.error?.message ??
        data?.status_txt ??
        (res.ok ? "ไม่มี URL รูปในคำตอบ" : `อัพโหลดล้มเหลว (${res.status})`);
      return NextResponse.json(
        { error: typeof msg === "string" ? msg : "อัพโหลดล้มเหลว" },
        { status: res.ok ? 502 : res.status }
      );
    }

    return NextResponse.json({ url: data.image.url });
  } catch (e) {
    console.error("Upload image error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพโหลด" },
      { status: 500 }
    );
  }
}
