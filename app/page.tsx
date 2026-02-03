import Image from "next/image";
import Link from "next/link";
import ContactForm from "./components/ContactForm";
import ImageCarousel from "./components/ImageCarousel";
import { FadeUpWhenVisible } from "./components/FadeUpWhenVisible";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";

const HERO_IMAGE_URL =
  "https://files.cdn-files-a.com/uploads/11631557/2000_697b27b2be189.jpg";

const ABOUT_IMAGE_URL =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_695b11503992e.jpg";

const BANNER_IMAGE_URL =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

const PLACEHOLDER_IMAGE =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await query<Product[]>(
      "SELECT id, name, subtitle, image, price, delivery_method, created_at, updated_at FROM products ORDER BY created_at DESC LIMIT 12"
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <main className="min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row">
        {/* Left panel - Light purple, text */}
        <section className="flex-1 flex flex-col items-center justify-center bg-[#e8e0f0] px-8 py-12 md:py-16 md:min-w-[33%]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d1b4e] tracking-wide uppercase text-center">
            MLT SHOP
          </h1>
          <div className="w-16 md:w-20 h-0.5 bg-[#6b5b7a] my-4 md:my-5" />
          <p className="text-lg md:text-xl text-[#2d1b4e]/90 text-center font-medium leading-relaxed">
            น้ำหอมสำหรับทุกโอกาส
          </p>
          <p className="text-lg md:text-xl text-[#2d1b4e]/90 text-center font-medium leading-relaxed mt-1">
            ราคาที่คุณจับต้องได้
          </p>
        </section>

        {/* Right panel - Light pink, image */}
        <section className="flex-[2] min-h-[50vh] md:min-h-[calc(100vh-3.5rem)] relative bg-[#fce4ec] overflow-hidden">
          <Image
            src={HERO_IMAGE_URL}
            alt="น้ำหอมหลากหลายแบรนด์"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </section>
      </main>

      {/* About Us section */}
      <FadeUpWhenVisible>
        <section className="bg-[#f0f0f0] py-12 md:py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Left - Image with border radius */}
          <div className="w-full md:flex-1 relative aspect-[4/5] md:aspect-square max-w-md mx-auto md:mx-0 overflow-hidden rounded-2xl shadow-md">
            <Image
              src={ABOUT_IMAGE_URL}
              alt="เกี่ยวกับ MLT SHOP"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right - Text content */}
          <div className="w-full md:flex-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b4e]">
              เกี่ยวกับเรา
            </h2>
            <div className="w-12 h-0.5 bg-[#6b5b7a] my-3" />
            <div className="space-y-4 text-[#333] leading-relaxed">
              <p>
                ร้านขายน้ำหอมออนไลน์ของเรามีจุดประสงค์เพื่อนำเสนอน้ำหอมคุณภาพ
                ราคาเข้าถึงได้ เหมาะกับบุคลิกและโอกาสที่หลากหลาย
              </p>
              <p>
                เราคำนึงถึงความสะดวกในการช้อปออนไลน์
                คัดสรรกลิ่นที่หลากหลายทั้งกลิ่นหวาน สดชื่น หรูหรา และสุภาพ
                พร้อมข้อมูลสินค้าที่ชัดเจนเพื่อช่วยให้คุณตัดสินใจได้ง่ายขึ้น
              </p>
            </div>
          </div>
        </div>
        </section>
      </FadeUpWhenVisible>

      {/* Banner: สัมผัสน้ำหอมใหม่ */}
      <FadeUpWhenVisible>
        <section className="relative w-full min-h-[50vh] md:min-h-[60vh] overflow-hidden">
        <Image
          src={BANNER_IMAGE_URL}
          alt="สัมผัสน้ำหอมใหม่ - แรงบันดาลใจในทุกสัมผัส"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 flex items-center justify-end pr-6 md:pr-12 lg:pr-20">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-5 md:px-8 md:py-6 rounded-lg shadow-lg max-w-sm text-right">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2d1b4e]">
              สัมผัสน้ำหอมใหม่
            </h2>
            <div className="w-12 h-0.5 bg-[#6b5b7a] my-3 ml-auto" />
            <p className="text-base md:text-lg text-[#333] font-medium">
              แรงบันดาลใจในทุกสัมผัส
            </p>
          </div>
        </div>
        </section>
      </FadeUpWhenVisible>

      {/* รีวิว section - carousel รูป */}
      <FadeUpWhenVisible>
        <ImageCarousel />
      </FadeUpWhenVisible>

      {/* สินค้า section - ดึงจาก DB */}
      <FadeUpWhenVisible>
        <section className="bg-[#e8e0f0] py-12 md:py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b4e] text-center">
            มาใหม่
          </h2>
          <div className="w-12 h-0.5 bg-[#6b5b7a] mx-auto my-3" />
          {products.length === 0 ? (
            <p className="text-center text-[#666] py-8">ยังไม่มีรายการมาใหม่</p>
          ) : (
            <ul className="flex flex-wrap justify-center gap-6 mt-8">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="w-full sm:w-[min(100%,280px)] lg:w-[min(100%,260px)]"
                >
                  <Link
                    href={`/shop/${p.id}`}
                    className="block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={p.image || PLACEHOLDER_IMAGE}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#2d1b4e]">{p.name}</h3>
                      {p.subtitle && (
                        <p className="text-sm text-[#666] mt-1 line-clamp-2">
                          {p.subtitle}
                        </p>
                      )}
                      <p className="mt-2 font-bold text-[#6b5b7a]">
                        ฿{Number(p.price).toLocaleString("th-TH")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </div>
        </section>
      </FadeUpWhenVisible>

      {/* Contact section */}
      <FadeUpWhenVisible>
        <section className="bg-[#F5F3F7] py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b4e] text-center">
            ติดต่อ
          </h2>
          <div className="w-12 h-0.5 bg-[#6b5b7a] mx-auto my-3" />
          <ContactForm />
        </div>
        </section>
      </FadeUpWhenVisible>
    </>
  );
}
