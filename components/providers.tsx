"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/auth-context";
import { AlertProvider } from "@/components/board/Alert";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AlertProvider>{children}</AlertProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
