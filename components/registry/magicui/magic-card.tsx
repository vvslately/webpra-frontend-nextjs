"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MagicCardProps = React.HTMLAttributes<HTMLDivElement> & {
  gradientColor?: string;
  gradientSize?: number;
  gradientOpacity?: number;
};

const MagicCard = React.forwardRef<HTMLDivElement, MagicCardProps>(
  (
    {
      className,
      children,
      gradientColor = "#262626",
      gradientSize = 200,
      gradientOpacity = 0.8,
      ...props
    },
    ref
  ) => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const divRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      },
      []
    );

    const handleMouseLeave = React.useCallback(() => {
      setPosition({ x: 0, y: 0 });
    }, []);

    return (
      <div
        ref={(node) => {
          (divRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border bg-background",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 40%)`,
            opacity: gradientOpacity,
          }}
        />
        <div className="relative">{children}</div>
      </div>
    );
  }
);
MagicCard.displayName = "MagicCard";

export { MagicCard };
