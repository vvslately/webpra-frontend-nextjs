import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/components/ui/sidebar";

const lineSeedSansTH = localFont({
  src: [
    {
      path: "./font/LINESeedSansTH_W_Th.woff",
      weight: "100",
      style: "normal",
    },
    {
      path: "./font/LINESeedSansTH_W_Rg.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./font/LINESeedSansTH_W_Bd.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./font/LINESeedSansTH_W_He.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "./font/LINESeedSansTH_W_XBd.woff",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-line-seed",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "vhouseforums - เว็บบอร์ดชุมชนถาม-ตอบ",
  description: "vhouseforums เว็บบอร์ดชุมชนสำหรับการถาม-ตอบ แชร์ความรู้ และแลกเปลี่ยนความคิดเห็น",
  keywords: ["เว็บบอร์ด", "forum", "vhouseforums", "ชุมชน", "ถาม-ตอบ"],
  authors: [{ name: "vhouseforums" }],
  openGraph: {
    title: "vhouseforums - เว็บบอร์ดชุมชนถาม-ตอบ",
    description: "vhouseforums เว็บบอร์ดชุมชนสำหรับการถาม-ตอบ แชร์ความรู้ และแลกเปลี่ยนความคิดเห็น",
    type: "website",
    siteName: "vhouseforums",
  },
  twitter: {
    card: "summary",
    title: "vhouseforums - เว็บบอร์ดชุมชนถาม-ตอบ",
    description: "vhouseforums เว็บบอร์ดชุมชนสำหรับการถาม-ตอบ แชร์ความรู้ และแลกเปลี่ยนความคิดเห็น",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={lineSeedSansTH.variable} suppressHydrationWarning>
      <body className="font-[family-name:var(--font-line-seed)] antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider defaultOpen={false}>
              {children}
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
