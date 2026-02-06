import { readFile } from "fs/promises";
import { join } from "path";
import type { Metadata } from "next";
import MarkdownViewerWrapper from "@/components/MarkdownViewerWrapper";

export const metadata: Metadata = {
  title: "โค้ด TypeScript ที่ใช้บ่อยๆ | MLT SHOP",
  description: "เอกสารรวบรวมโค้ด TypeScript ที่ใช้บ่อยๆ ในการพัฒนาเว็บไซต์ Next.js",
};

export default async function CodeCommonPage() {
  let content = "";

  try {
    const filePath = join(process.cwd(), "common-code.md");
    content = await readFile(filePath, "utf-8");
  } catch (error) {
    console.error("Error reading common-code.md:", error);
    content = "# ไม่พบไฟล์\n\nไม่สามารถโหลดไฟล์ common-code.md ได้";
  }

  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2d1b4e] mb-2">
              โค้ด TypeScript ที่ใช้บ่อยๆ
            </h1>
            <div className="w-16 h-1 bg-[#6b5b7a] mb-4" />
            <p className="text-[#666] text-lg">
              เอกสารรวบรวมโค้ด TypeScript ที่ใช้บ่อยๆ ในการพัฒนาเว็บไซต์ Next.js
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
