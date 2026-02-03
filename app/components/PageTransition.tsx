"use client";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div data-page-content className="min-h-full">
      {children}
    </div>
  );
}
