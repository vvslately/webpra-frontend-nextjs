"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

const CAROUSEL_SLIDES = [
  {
    src: "https://files.cdn-files-a.com/admin/system_photos_stock/2000_system_photo_695352b22570f.png",
    alt: "รีวิว 1",
    title: "คนออฟฟิศสาวผู้รักความงาม",
    name: "นางสาวหวานใจ ใจเย็น",
    content:
      "ฉันรักน้ำหอมจาก MLT SHOP จริง ๆ กลิ่นหอมติดทนนานและทำให้คนรอบข้างชมเชยตลอดวัน",
  },
  {
    src: "https://files.cdn-files-a.com/admin/system_photos_stock/2000_system_photo_695352d537ec0.png",
    alt: "รีวิว 2",
    title: "นักธุรกิจผู้มีกลิ่นอายความมั่นใจ",
    name: "นายจอง จิตตั้งตรง",
    content:
      "กลิ่นหอมที่ไม่เพียงแต่ถูกใจฉัน แต่ภรรยาของฉันก็ชื่นชอบด้วย!",
  },
  {
    src: "https://files.cdn-files-a.com/admin/system_photos_stock/2000_system_photo_695352cf89387.png",
    alt: "รีวิว 3",
    title: "หาซื้อของขวัญสำหรับโอกาสพิเศษ",
    name: "คุณน้องอ้อม ก้าวหน้า",
    content:
      "ซื้อเป็นของขวัญแล้วได้รับคำชมอย่างเต็มอิ่ม น้ำหอมจาก MLT SHOP ไม่ทำให้ผิดหวังแน่นอน",
  },
];

const AUTO_PLAY_MS = 5000;

export default function ImageCarousel() {
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [goNext]);

  return (
    <section className="bg-[#f0f0f0] py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2d1b4e] text-center">
          รีวิว
        </h2>
        <div className="w-10 sm:w-12 h-0.5 bg-[#6b5b7a] mx-auto my-2 sm:my-3" />

        <div className="relative mt-6 sm:mt-8 overflow-hidden rounded-xl sm:rounded-2xl shadow-lg bg-white max-w-2xl mx-auto">
          {/* การ์ดแนวตั้ง: รูปบน (เต็มความกว้าง) + บล็อกข้อความล่าง */}
          <div className="flex flex-col">
            {/* รูปด้านบน - aspect กว้างแบบ 16:9 */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] shrink-0">
              {CAROUSEL_SLIDES.map((slide, i) => (
                <div
                  key={slide.src + i}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                  aria-hidden={i !== index}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-cover object-center rounded-t-xl sm:rounded-t-2xl"
                    sizes="(max-width: 768px) 100vw, 672px"
                    unoptimized
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {/* บล็อกข้อความสีขาวด้านล่าง: หมวด (เล็ก) → ชื่อ (ตัวหนา) → รีวิว → ดาว */}
            <div className="relative flex flex-col bg-white px-5 py-5 sm:px-6 sm:py-6 rounded-b-xl sm:rounded-b-2xl">
              {CAROUSEL_SLIDES.map((slide, i) => (
                <div
                  key={slide.src + i}
                  className={`flex flex-col text-left transition-opacity duration-500 ${
                    i === index ? "opacity-100 z-10" : "absolute inset-0 opacity-0 z-0 pointer-events-none"
                  }`}
                  aria-hidden={i !== index}
                >
                  <p className="text-sm text-[#666]">
                    {slide.title}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-[#2d1b4e] mt-0.5">
                    {slide.name}
                  </p>
                  <p className="text-[#333] text-sm sm:text-base leading-relaxed mt-2">
                    {slide.content}
                  </p>
                  <p className="text-amber-500 text-lg mt-3" aria-label="5 ดาว">
                    ★★★★★
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ปุ่ม Prev / Next - อยู่ด้านข้าง การ์ด บนแนวรูป */}
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 sm:left-3 top-[18%] sm:top-1/4 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-[#2d1b4e] transition-colors border border-gray-100"
            aria-label="รีวิวก่อนหน้า"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 sm:right-3 top-[18%] sm:top-1/4 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-[#2d1b4e] transition-colors border border-gray-100"
            aria-label="รีวิวถัดไป"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots - ด้านล่างการ์ด */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors touch-manipulation ${
                  i === index ? "bg-[#2d1b4e]" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`ไปที่รีวิวที่ ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
