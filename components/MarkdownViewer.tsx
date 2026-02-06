"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useEffect } from "react";

interface MarkdownViewerProps {
  content: string;
}

// Function to generate ID from text (matches GitHub Flavored Markdown format)
function generateId(text: string): string {
  if (!text) return "";
  
  // Convert React children to string
  const textStr = String(text);
  
  // Remove emoji and special characters, keep only Thai and English
  const cleaned = textStr
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // Remove emoji
    .replace(/[🔷🗄️🌐📄🎨🔄📝🔐🛠️⚠️📚📋🚀]/g, "") // Remove specific emoji
    .trim();
  
  // Convert to lowercase and replace spaces with hyphens
  // Keep Thai characters, English letters, numbers, spaces, and hyphens
  return cleaned
    .toLowerCase()
    .replace(/[^\w\s-ก-๙]/g, "") // Keep Thai characters, English, numbers, spaces, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .trim();
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  useEffect(() => {
    // Handle anchor links with smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
        const href = target.getAttribute("href");
        if (href) {
          e.preventDefault();
          const id = href.substring(1);
          const element = document.getElementById(id);
          if (element) {
            const offset = 80; // Offset for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return (
    <div className="markdown-content prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, children, ...props }: any) => {
            const id = generateId(String(children));
            return (
              <h1
                id={id}
                className="text-4xl font-bold text-[#2d1b4e] mb-6 mt-8 border-b-2 border-[#6b5b7a] pb-2 scroll-mt-20"
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2: ({ node, children, ...props }: any) => {
            const id = generateId(String(children));
            return (
              <h2
                id={id}
                className="text-3xl font-bold text-[#2d1b4e] mb-4 mt-6 border-b border-[#6b5b7a] pb-2 scroll-mt-20"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3: ({ node, children, ...props }: any) => {
            const id = generateId(String(children));
            return (
              <h3
                id={id}
                className="text-2xl font-semibold text-[#2d1b4e] mb-3 mt-5 scroll-mt-20"
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4: ({ node, children, ...props }: any) => {
            const id = generateId(String(children));
            return (
              <h4
                id={id}
                className="text-xl font-semibold text-[#2d1b4e] mb-2 mt-4 scroll-mt-20"
                {...props}
              >
                {children}
              </h4>
            );
          },
          p: ({ node, ...props }) => (
            <p className="text-[#333] leading-relaxed mb-4" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-[#333]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-[#333]" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code className="bg-[#f5f3f7] px-2 py-1 rounded text-sm text-[#6b5b7a] font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={`${className} block`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto mb-4 border border-[#333]" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[#6b5b7a] pl-4 italic text-[#666] my-4" {...props} />
          ),
          a: ({ node, href, ...props }: any) => {
            const isAnchor = href?.startsWith("#");
            return (
              <a
                href={href}
                className={`text-[#6b5b7a] hover:text-[#5a4a69] underline ${isAnchor ? "cursor-pointer" : ""}`}
                {...props}
              />
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-[#2d1b4e]" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-t-2 border-[#6b5b7a] my-8" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-[#ddd]" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#6b5b7a] text-white" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-[#ddd] hover:bg-[#f5f3f7]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-[#ddd] px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-[#ddd] px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
