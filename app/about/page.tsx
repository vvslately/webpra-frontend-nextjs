import Image from "next/image";
import { FadeUpWhenVisible } from "../components/FadeUpWhenVisible";

const ABOUT_IMAGE_URL =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_695b11503992e.jpg";

export const metadata = {
  title: "เกี่ยวกับเรา | MLT SHOP",
  description:
    "ร้านจำหน่ายน้ำหอมออนไลน์ นำเสนอน้ำหอมคุณภาพดีในราคาที่เข้าถึงได้ คัดสรรกลิ่นหลากหลาย",
};

export default function AboutPage() {
  return (
    <section className="min-h-screen w-full flex flex-col md:flex-row bg-[#e8e6ea]">
      {/* Left - Image full height (เต็มหน้า) */}
      <div className="w-full md:w-[45%] min-h-[50vh] md:min-h-screen relative shrink-0">
        <Image
          src={ABOUT_IMAGE_URL}
          alt="เกี่ยวกับเรา - MLT SHOP น้ำหอมออนไลน์"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 45vw"
          priority
        />
      </div>

      {/* Right - Text content */}
      <FadeUpWhenVisible className="w-full md:w-[55%] flex flex-col justify-center px-6 py-12 md:px-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2d1b4e]">
          เกี่ยวกับเรา
        </h1>
        <div className="w-12 h-0.5 bg-[#6b5b7a] my-4" />
        <div className="text-[#333] leading-relaxed space-y-4 text-base md:text-lg">
          <p>
            ร้านของเราเป็นร้านจำหน่ายน้ำหอมออนไลน์ที่ก่อตั้งขึ้นด้วย
            ความตั้งใจในการนำเสนอน้ำหอมคุณภาพดีในราคาที่เข้าถึง
            ได้ เพื่อให้ลูกค้าทุกคนสามารถเลือกกลิ่นหอมที่เหมาะกับ
            บุคลิกและโอกาสต่าง ๆ ในชีวิตประจำวันได้อย่างสะดวก
            สบายผ่านระบบออนไลน์
          </p>
          <p>
            เราคัดสรรน้ำหอมหลากหลายกลิ่น ทั้งโทนหวาน สดชื่น หรูหรา
            และสุภาพ เพื่อรองรับความต้องการของลูกค้าทุกเพศทุกวัย
            พร้อมให้ข้อมูลรายละเอียดของสินค้าอย่างชัดเจน
            เพื่อช่วยในการตัดสินใจเลือกซื้อ
          </p>
        </div>
      </FadeUpWhenVisible>
    </section>
  );
}
