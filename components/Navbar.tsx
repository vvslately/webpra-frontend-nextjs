"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ViewTransitionLink } from "@/components/ViewTransitionLink";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Wallet } from "lucide-react";

type SessionUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
};

const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "เกี่ยวกับ" },
  { href: "/shop", label: "ร้านค้า" },
  { href: "/contact", label: "ติดต่อ" },
];

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      {/* Four-petal flower / propeller shape */}
      <ellipse cx="12" cy="6" rx="3" ry="5" />
      <ellipse cx="12" cy="18" rx="3" ry="5" />
      <ellipse cx="6" cy="12" rx="5" ry="3" />
      <ellipse cx="18" cy="12" rx="5" ry="3" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    router.refresh();
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#2d1b4e]">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Brand */}
        <ViewTransitionLink
          href="/"
          className="flex items-center gap-2 text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-opacity duration-200 hover:opacity-90"
          onClick={closeMenu}
        >
          <LogoIcon className="h-6 w-6 shrink-0" />
          <span className="text-lg font-semibold tracking-wide uppercase">
            MLT SHOP
          </span>
        </ViewTransitionLink>

        {/* Desktop Nav links + Login/User + Cart */}
        <div className="hidden md:flex items-center gap-6 sm:gap-8">
          <ul className="flex items-center gap-6 sm:gap-8">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <ViewTransitionLink
                    href={href}
                    className={cn(
                      "group relative inline-block text-sm font-medium text-white no-underline outline-none transition-[color,opacity] duration-200 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50",
                      isActive && "text-white"
                    )}
                  >
                    <span className="relative">{label}</span>
                    {/* Minimal hover: thin underline animates in */}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-px bg-white/80 transition-[transform] duration-200 ease-out origin-left",
                        isActive ? "w-full scale-x-100" : "w-full scale-x-0 group-hover:scale-x-100"
                      )}
                      aria-hidden
                    />
                  </ViewTransitionLink>
                </li>
              );
            })}
          </ul>
          {user ? (
            <div className="relative flex items-center gap-4">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-white outline-none hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/50 rounded p-1"
                aria-label="เมนูผู้ใช้"
                aria-expanded={userMenuOpen}
              >
                <UserIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{user.username}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-lg bg-white shadow-lg border border-gray-100 py-2 text-left">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-[#2d1b4e]">
                        {user.username}
                      </p>
                      <p className="text-xs text-[#666]">ยอดเงิน: ฿{Number(user.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <Link
                      href="/topup"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-left text-[#6b5b7a] hover:bg-gray-50 font-medium"
                    >
                      <Wallet className="h-4 w-4" />
                      เติมเงิน
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-left text-[#6b5b7a] hover:bg-gray-50 font-medium"
                      >
                        หลังบ้าน
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-left text-[#333] hover:bg-gray-50"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </>
              )}
              <ViewTransitionLink
                href="/cart"
                className="relative inline-flex text-white outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={`ตะกร้าสินค้า ${totalItems > 0 ? totalItems : ""}`}
              >
                <CartIcon className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-white text-[#2d1b4e] text-xs font-bold px-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </ViewTransitionLink>
            </div>
          ) : (
            <>
              <ViewTransitionLink
                href="/login"
                className="text-sm font-medium text-white no-underline transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50"
              >
                เข้าสู่ระบบ
              </ViewTransitionLink>
              <ViewTransitionLink
                href="/cart"
                className="relative inline-flex text-white outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={`ตะกร้าสินค้า ${totalItems > 0 ? totalItems : ""}`}
              >
                <CartIcon className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-white text-[#2d1b4e] text-xs font-bold px-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </ViewTransitionLink>
            </>
          )}
        </div>

        {/* Mobile: Login/User + Cart + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {user ? (
            <ViewTransitionLink
              href="/topup"
              className="flex items-center gap-1.5 text-white text-sm hover:opacity-90 transition-opacity"
              aria-label={`ยอดเงิน ฿${user.balance} คลิกเพื่อเติมเงิน`}
            >
              <Wallet className="h-5 w-5" />
              <span className="font-medium">฿{Number(user.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
            </ViewTransitionLink>
          ) : (
            <ViewTransitionLink
              href="/login"
              className="text-sm font-medium text-white no-underline transition-opacity duration-200 hover:opacity-90"
            >
              เข้าสู่ระบบ
            </ViewTransitionLink>
          )}
          <ViewTransitionLink
            href="/cart"
            className="relative inline-flex text-white outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={`ตะกร้าสินค้า ${totalItems > 0 ? totalItems : ""}`}
          >
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-white text-[#2d1b4e] text-xs font-bold px-1">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </ViewTransitionLink>
          <button
            onClick={toggleMenu}
            className="text-white outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/50 p-1"
            aria-label="เมนู"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#2d1b4e]">
          <ul className="flex flex-col py-4">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <ViewTransitionLink
                    href={href}
                    onClick={closeMenu}
                    className={cn(
                      "block px-4 py-3 text-base font-medium text-white no-underline transition-[color,background-color] duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50",
                      isActive && "bg-white/10 text-white"
                    )}
                  >
                    {label}
                  </ViewTransitionLink>
                </li>
              );
            })}
            {user ? (
              <>
                <li>
                  <ViewTransitionLink
                    href="/topup"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium text-white no-underline transition-colors duration-200 hover:bg-white/10"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>เติมเงิน</span>
                    <span className="ml-auto text-sm opacity-80">
                      ฿{Number(user.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                  </ViewTransitionLink>
                </li>
                {user.role === "admin" && (
                  <li>
                    <ViewTransitionLink
                      href="/admin"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-base font-medium text-white no-underline transition-colors duration-200 hover:bg-white/10"
                    >
                      หลังบ้าน
                    </ViewTransitionLink>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                    className="block w-full px-4 py-3 text-left text-base font-medium text-white hover:bg-white/10"
                  >
                    ออกจากระบบ
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-base font-medium text-white no-underline hover:bg-white/10"
                >
                  เข้าสู่ระบบ
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
