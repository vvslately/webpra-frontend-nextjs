"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const HIDE_NAVBAR_FOOTER_PATHS = ["/code_common", "/command"];

export function ConditionalNavbarFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldHide = HIDE_NAVBAR_FOOTER_PATHS.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
