"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { ComponentProps } from "react";

type ViewTransitionLinkProps = ComponentProps<typeof Link>;

export function ViewTransitionLink({
  href,
  onClick,
  children,
  ...rest
}: ViewTransitionLinkProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) onClick(e);
      if (e.defaultPrevented) return;
      if (typeof href !== "string" || !href.startsWith("/")) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.currentTarget.target;
      if (target && target !== "_self") return;

      e.preventDefault();
      const url = href;
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          router.push(url);
        });
      } else {
        router.push(url);
      }
    },
    [href, onClick, router]
  );

  if (typeof href === "string" && href.startsWith("/")) {
    return (
      <Link href={href} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
