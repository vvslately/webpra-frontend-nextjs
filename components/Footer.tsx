import { ViewTransitionLink } from "@/components/ViewTransitionLink";

const footerLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "เกี่ยวกับ" },
  { href: "/shop", label: "ร้านค้า" },
  { href: "/contact", label: "ติดต่อ" },
];

export function Footer() {
  return (
    <footer className="bg-[#1f1b2c] text-white/95">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          {/* ซ้าย - แบรนด์ + ลิขสิทธิ์ */}
          <div className="flex flex-col gap-2">
            <span className="text-xl md:text-2xl font-bold text-white">
              MLT SHOP
            </span>
            <p className="text-sm text-white/90">
              ลิขสิทธิ์ © 2026 สงวนลิขสิทธิ์
            </p>

          </div>

          {/* ขวา - ลิงก์นำทาง */}
          <div className="flex flex-col gap-4">
            <nav
              className="flex flex-wrap justify-start md:justify-end gap-x-6 gap-y-2"
              aria-label="ลิงก์นำทางส่วนท้าย"
            >
              {footerLinks.map(({ href, label }) => (
                <ViewTransitionLink
                  key={href}
                  href={href}
                  className="text-sm text-white/90 hover:text-white transition-colors duration-200"
                >
                  {label}
                </ViewTransitionLink>
              ))}
            </nav>
            <nav
              className="flex flex-wrap justify-start md:justify-end gap-x-6 gap-y-2"
              aria-label="เอกสาร"
            >
              <ViewTransitionLink
                href="/code_common"
                className="text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                โค้ดที่ใช้บ่อย
              </ViewTransitionLink>
              <ViewTransitionLink
                href="/command"
                className="text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                คำสั่งทั้งหมด
              </ViewTransitionLink>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
