# LINE Seed Sans TH Font Setup

## ฟอนต์ที่ใช้ในโปรเจค

เว็บไซต์ WebChao ใช้ **LINE Seed Sans TH** เป็นฟอนต์หลักสำหรับการแสดงผลเนื้อหาภาษาไทยทั้งหมด

## ไฟล์ฟอนต์

โปรเจคนี้ประกอบด้วยฟอนต์ LINE Seed Sans TH ในรูปแบบ WOFF ทั้งหมด 5 น้ำหนัก:

1. **LINESeedSansTH_W_Th.woff** - Thin/Light (Weight: 100)
2. **LINESeedSansTH_W_Rg.woff** - Regular (Weight: 400)
3. **LINESeedSansTH_W_Bd.woff** - Bold (Weight: 700)
4. **LINESeedSansTH_W_He.woff** - Heavy (Weight: 800)
5. **LINESeedSansTH_W_XBd.woff** - Extra Bold (Weight: 900)

## การตั้งค่า

### 1. Import ใน `app/layout.tsx`

ฟอนต์ถูก import ด้วย `next/font/local`:

```typescript
import localFont from "next/font/local";

const lineSeedSansTH = localFont({
  src: [
    {
      path: "./font/LINESeedSansTH_W_Th.woff",
      weight: "100",
      style: "normal",
    },
    {
      path: "./font/LINESeedSansTH_W_Rg.woff",
      weight: "400",
      style: "normal",
    },
    // ... weights อื่น ๆ
  ],
  variable: "--font-line-seed",
  display: "swap",
  preload: true,
});
```

### 2. Apply ใน HTML

```typescript
<html lang="th" className={lineSeedSansTH.variable}>
  <body className="font-[family-name:var(--font-line-seed)]">
    {children}
  </body>
</html>
```

### 3. CSS Variables

ใน `app/globals.css`:

```css
@theme inline {
  --font-sans: var(--font-line-seed);
}

body {
  font-family: var(--font-line-seed), -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## การใช้งาน

### ใน Tailwind CSS

```tsx
// ฟอนต์จะถูกใช้โดยอัตโนมัติในทุก element
<h1 className="text-3xl font-bold">หัวข้อ</h1>
<p className="text-base">เนื้อหา</p>

// ใช้ weights ต่าง ๆ
<p className="font-light">ข้อความบาง</p>
<p className="font-normal">ข้อความปกติ</p>
<p className="font-bold">ข้อความหนา</p>
<p className="font-extrabold">ข้อความหนามาก</p>
```

### ใน CSS

```css
.custom-class {
  font-family: var(--font-line-seed);
  font-weight: 400; /* Regular */
}

.heavy-text {
  font-weight: 800; /* Heavy */
}
```

## คุณสมบัติ

### Font Display: Swap
- ใช้ `font-display: swap` เพื่อแสดงเนื้อหาก่อนโหลดฟอนต์เสร็จ
- ป้องกันปัญหา FOIT (Flash of Invisible Text)
- เพิ่มประสิทธิภาพการโหลดหน้าเว็บ

### Preload
- ตั้งค่า `preload: true` เพื่อโหลดฟอนต์ล่วงหน้า
- ทำให้การแสดงผลเร็วขึ้นโดยเฉพาะครั้งแรก

### Optimization
- Next.js จะ optimize ฟอนต์โดยอัตโนมัติ
- สร้าง subset ของฟอนต์ที่ใช้จริง
- ลดขนาดไฟล์และเพิ่มความเร็ว

## Weight Mapping

| CSS Weight | Font File | Usage |
|------------|-----------|-------|
| 100 | LINESeedSansTH_W_Th.woff | Thin/Light headings |
| 400 | LINESeedSansTH_W_Rg.woff | Body text (default) |
| 700 | LINESeedSansTH_W_Bd.woff | Bold emphasis |
| 800 | LINESeedSansTH_W_He.woff | Heavy titles |
| 900 | LINESeedSansTH_W_XBd.woff | Extra bold headings |

## ข้อดี

1. **รองรับภาษาไทย**: ฟอนต์ที่ออกแบบมาเพื่อภาษาไทยโดยเฉพาะ
2. **Performance**: ใช้ WOFF format ที่ optimize แล้ว
3. **ความเรียบร้อย**: ตัวอักษรอ่านง่ายและสวยงาม
4. **Responsive**: ใช้ได้ดีในทุกขนาดหน้าจอ
5. **Modern**: ออกแบบมาเพื่อยุคดิจิทัล

## ที่มาของฟอนต์

LINE Seed Sans TH เป็นฟอนต์ที่พัฒนาโดย LINE Corporation  
สามารถดาวน์โหลดได้จาก: [LINE Seed Font Official Website](https://seed.line.me/index_en.html)

## Best Practices

1. ใช้ weight ที่เหมาะสมตาม context
2. ไม่ควรใช้ฟอนต์น้ำหนักหนักเกินไปสำหรับ body text
3. ใช้ font-weight ใน Tailwind classes แทนการเขียน CSS โดยตรง
4. ทดสอบการอ่านในขนาดต่าง ๆ
5. ตรวจสอบ contrast ratio ตาม accessibility guidelines

## Troubleshooting

### ฟอนต์ไม่แสดงผล
- ตรวจสอบว่าไฟล์ฟอนต์อยู่ที่ path ที่ถูกต้อง
- Clear cache และ rebuild

### ตัวอักษรไม่สวย
- ตรวจสอบว่าใช้ font-weight ที่ถูกต้อง
- Ensure `antialiased` class ถูกใช้ใน body

### โหลดช้า
- ตรวจสอบว่า preload ทำงาน
- ตรวจสอบขนาดไฟล์ฟอนต์
- ใช้ Next.js ในการ optimize

## Reference

- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [LINE Seed Font](https://seed.line.me/)
- [Font Display Strategies](https://web.dev/font-display/)

