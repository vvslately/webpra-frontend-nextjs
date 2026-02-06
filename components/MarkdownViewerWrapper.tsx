"use client";

import dynamic from "next/dynamic";

const MarkdownViewer = dynamic(() => import("@/components/MarkdownViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-[#666]">กำลังโหลด...</div>
    </div>
  ),
});

interface MarkdownViewerWrapperProps {
  content: string;
}

export default function MarkdownViewerWrapper({ content }: MarkdownViewerWrapperProps) {
  return <MarkdownViewer content={content} />;
}
