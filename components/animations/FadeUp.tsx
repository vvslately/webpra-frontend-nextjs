"use client";

import { FadeUpWhenVisible } from "@/app/components/FadeUpWhenVisible";

export function FadeUp({
  children,
  className,
  delay,
  once,
  threshold,
  rootMargin,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}) {
  return (
    <FadeUpWhenVisible
      className={className}
      delay={delay}
      once={once}
      threshold={threshold}
      rootMargin={rootMargin}
    >
      {children}
    </FadeUpWhenVisible>
  );
}
