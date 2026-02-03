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
    src: "https://files.cdn-files-a.com/admin/system_photos_stock/2000_system_photo_695352d537ec0.png",
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
    <section className="bg-[#f0f0f0] py-12 md:py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b4e] text-center">
          รีวิว
        </h2>
        <div className="w-12 h-0.5 bg-[#6b5b7a] mx-auto my-3" />

        <div className="relative mt-8 overflow-hidden rounded-2xl shadow-lg bg-gray-100">
          {/* Slides: รูปซ้าย + ข้อความรีวิวขวา */}
          <div className="flex flex-col md:flex-row min-h-[280px] md:min-h-[320px]">
            {/* รูปด้านซ้าย */}
            <div className="relative w-full md:w-[55%] aspect-[4/3] md:aspect-auto md:min-h-[320px] shrink-0">
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
                    className="object-cover object-center rounded-t-2xl md:rounded-t-2xl md:rounded-b-none md:rounded-l-2xl md:rounded-r-none"
                    sizes="(max-width: 768px) 100vw, 55vw"
                    unoptimized
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {/* ข้อความรีวิวด้านขวา */}
            <div className="relative flex-1 flex flex-col justify-center bg-white md:bg-white/95 px-6 py-6 md:px-8 md:py-8 rounded-r-2xl md:rounded-r-2xl rounded-b-2xl md:rounded-b-none">
              {CAROUSEL_SLIDES.map((slide, i) => (
                <div
                  key={slide.src + i}
                  className={`absolute inset-0 flex flex-col justify-center px-6 py-6 md:px-8 md:py-8 transition-opacity duration-500 ${
                    i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                  aria-hidden={i !== index}
                >
                  <h3 className="text-lg md:text-xl font-bold text-[#2d1b4e]">
                    {slide.title}
                  </h3>
                  <p className="text-sm md:text-base text-[#6b5b7a] mt-1">
                    {slide.name}
                  </p>
                  <p className="text-[#333] leading-relaxed mt-3 md:mt-4">
                    {slide.content}
                  </p>
                  <p className="text-amber-500 text-lg md:text-xl mt-3" aria-label="5 ดาว">
                    ★★★★★
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next */}
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-[#2d1b4e] transition-colors"
            aria-label="รูปก่อนหน้า"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-[#2d1b4e] transition-colors"
            aria-label="รูปถัดไป"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === index ? "bg-[#2d1b4e]" : "bg-white/80 hover:bg-white"
                }`}
                aria-label={`ไปที่รูปที่ ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
