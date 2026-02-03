import { query } from "@/lib/db";
import Link from "next/link";

type Row = { ok?: number; [key: string]: unknown };

export default async function DbTestPage() {
  let status: "ok" | "error" = "ok";
  let message = "";
  let rows: Row[] = [];

  try {
    rows = (await query<Row[]>("SELECT 1 AS ok")) as Row[];
    message = "เชื่อมต่อฐานข้อมูลสำเร็จ (SSR)";
  } catch (err) {
    status = "error";
    message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-12 bg-[#e8e0f0]">
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-4">ทดสอบ DB (SSR)</h1>
      <div
        className={`rounded-lg px-6 py-4 max-w-md ${
          status === "ok"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        <p className="font-medium">{message}</p>
        {rows.length > 0 && (
          <p className="mt-2 text-sm">ผลลัพธ์: {JSON.stringify(rows)}</p>
        )}
      </div>
      <Link
        href="/"
        className="mt-6 text-[#6b5b7a] font-medium hover:underline"
      >
        ← กลับหน้าแรก
      </Link>
    </div>
  );
}
