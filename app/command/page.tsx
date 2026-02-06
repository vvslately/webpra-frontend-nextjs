import { readFile } from "fs/promises";
import { join } from "path";
import type { Metadata } from "next";
import MarkdownViewerWrapper from "@/components/MarkdownViewerWrapper";

export const metadata: Metadata = {
  title: "คำสั่งทั้งหมดสำหรับสร้างเว็บไซต์ | MLT SHOP",
  description: "เอกสารรวบรวมคำสั่งทั้งหมดที่ใช้ในการสร้างและพัฒนาเว็บไซต์ Next.js",
};

export default async function CommandPage() {
  let content = "";

  try {
    const filePath = join(process.cwd(), "command.md");
    content = await readFile(filePath, "utf-8");
  } catch (error) {
    console.error("Error reading command.md:", error);
    content = "# ไม่พบไฟล์\n\nไม่สามารถโหลดไฟล์ command.md ได้";
  }

  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2d1b4e] mb-2">
              คำสั่งทั้งหมดสำหรับสร้างเว็บไซต์
            </h1>
            <div className="w-16 h-1 bg-[#6b5b7a] mb-4" />
            <p className="text-[#666] text-lg">
              เอกสารรวบรวมคำสั่งทั้งหมดที่ใช้ในการสร้างและพัฒนาเว็บไซต์ Next.js
            </p>
          </div>
          <div className="prose-container">
            <MarkdownViewerWrapper content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
