"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type FadeUpWhenVisibleProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before starting the animation (for stagger) */
  delay?: number;
  /** Only animate once when first visible (default true) */
  once?: boolean;
  /** Fraction of element that must be visible (0–1), default 0.1 */
  threshold?: number;
  /** Root margin e.g. "0px 0px -40px 0px" to trigger a bit earlier */
  rootMargin?: string;
};

export function FadeUpWhenVisible({
  children,
  className,
  delay = 0,
  once = true,
  threshold = 0.1,
  rootMargin = "0px 0px -24px 0px",
}: FadeUpWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimatedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (once && hasAnimatedRef.current) return;
          hasAnimatedRef.current = true;
          if (delay > 0) {
            timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay, once, threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}
