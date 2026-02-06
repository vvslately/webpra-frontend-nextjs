# โค้ด TypeScript ที่ใช้บ่อยๆ สำหรับสร้างเว็บไซต์

เอกสารนี้รวบรวมโค้ด TypeScript ที่ใช้บ่อยๆ ในการพัฒนาเว็บไซต์ Next.js นี้ พร้อมคำอธิบายการใช้งานและตัวอย่าง

---

## 📋 สารบัญ

1. [Types และ Interfaces](#types-และ-interfaces) - การกำหนดโครงสร้างข้อมูลและ type safety
2. [Database Queries](#database-queries) - การเชื่อมต่อและ query ข้อมูลจากฐานข้อมูล MySQL
3. [API Routes (Route Handlers)](#api-routes-route-handlers) - การสร้าง API endpoints สำหรับรับส่งข้อมูล
4. [Server Components](#server-components) - Components ที่รันบน server สำหรับดึงข้อมูลและ render
5. [Client Components](#client-components) - Components ที่รันบน client สำหรับ interactivity
6. [React Context และ Hooks](#react-context-และ-hooks) - การจัดการ global state และ custom hooks
7. [Form Handling](#form-handling) - การจัดการ forms พร้อม validation
8. [Authentication](#authentication) - ระบบ authentication ด้วย JWT และ password hashing
9. [Utilities และ Helper Functions](#utilities-และ-helper-functions) - ฟังก์ชันช่วยเหลือต่างๆ เช่น class names, API client
10. [Error Handling](#error-handling) - การจัดการ errors ใน API routes และ components

---

## 🔷 Types และ Interfaces

### 1. สร้าง Interface สำหรับ Data Model

```typescript
// lib/types.ts

export interface Product {
  id: number;
  name: string;
  subtitle: string | null;
  image: string | null;
  price: string;
  delivery_method: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface Review {
  id: number;
  author_name: string;
  content: string;
  rating: number | null;
  product_id: number | null;
  created_at: Date | string | null;
}
```

**คำอธิบาย:**
- ใช้ `interface` เพื่อกำหนดโครงสร้างของ object
- `| null` หมายถึงฟิลด์นั้นสามารถเป็น null ได้
- ใช้สำหรับ type safety และ autocomplete ใน IDE

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการกำหนดโครงสร้างข้อมูลจาก database
- เมื่อต้องการ type safety สำหรับ props และ state
- เมื่อต้องการให้ IDE แสดง autocomplete

---

### 2. สร้าง Type สำหรับ API Request/Response

```typescript
// lib/api.ts

export type UpdateProfileRequest = {
  display_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_password?: string;
};

type ApiResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error?: string };
```

**คำอธิบาย:**
- ใช้ `type` สำหรับ union types หรือ type aliases
- `?` หมายถึง optional property
- `T` คือ generic type parameter

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการกำหนดโครงสร้างของ API request/response
- เมื่อต้องการ union types (เช่น success/error response)
- เมื่อต้องการใช้ generic types

---

### 3. สร้าง Type สำหรับ Component Props

```typescript
// components/ui/button.tsx

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

**คำอธิบาย:**
- `extends` ใช้เพื่อสืบทอด properties จาก type อื่น
- `React.ButtonHTMLAttributes<HTMLButtonElement>` ให้ properties ของ HTML button element
- `VariantProps` ให้ variant properties จาก class-variance-authority

**เมื่อไหร่ควรใช้:**
- เมื่อสร้าง reusable components
- เมื่อต้องการให้ component รองรับ HTML attributes
- เมื่อใช้ component variants

---

## 🗄️ Database Queries

### 1. สร้าง Database Connection Pool

```typescript
// lib/db.ts

import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "210.246.215.19",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "punchmade",
  password: process.env.DB_PASSWORD || "PunchMade@123!",
  database: process.env.DB_NAME || "punchvv",
};

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}
```

**คำอธิบาย:**
- ใช้ connection pool เพื่อจัดการ database connections
- `process.env` ใช้สำหรับอ่าน environment variables
- Singleton pattern เพื่อให้มี pool เดียวในทั้งโปรเจกต์

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการเชื่อมต่อ MySQL database
- เมื่อต้องการ reuse connections แทนการสร้างใหม่ทุกครั้ง

---

### 2. Query ข้อมูลจาก Database

```typescript
// lib/db.ts

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}
```

**คำอธิบาย:**
- `async function` ใช้สำหรับ asynchronous operations
- `<T>` คือ generic type parameter สำหรับกำหนด return type
- `Promise<T>` คือ return type ที่เป็น Promise
- `params` ใช้สำหรับ parameterized queries เพื่อป้องกัน SQL injection

**ตัวอย่างการใช้งาน:**

```typescript
// ดึงข้อมูล products
const products = await query<Product[]>(
  "SELECT id, name, subtitle, image, price FROM products ORDER BY created_at DESC"
);

// Query พร้อม parameters
const user = await query<UserRow[]>(
  "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
  [login, login]
);
```

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการดึงข้อมูลจาก database
- เมื่อต้องการใช้ parameterized queries เพื่อความปลอดภัย

---

### 3. Transaction สำหรับหลาย Queries

```typescript
// lib/db.ts

export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
```

**คำอธิบาย:**
- Transaction ใช้เมื่อต้องการให้หลาย queries ทำงานร่วมกัน
- ถ้าเกิด error จะ rollback ทั้งหมด
- `finally` block จะรันเสมอเพื่อ release connection

**ตัวอย่างการใช้งาน:**

```typescript
await withTransaction(async (conn) => {
  await conn.execute("INSERT INTO orders (...) VALUES (...)", [...]);
  await conn.execute("INSERT INTO order_items (...) VALUES (...)", [...]);
  // ถ้าเกิด error ที่ไหนก็ตาม จะ rollback ทั้งหมด
});
```

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการทำหลาย queries ที่ต้องสำเร็จพร้อมกัน
- เมื่อต้องการความสอดคล้องของข้อมูล (data consistency)

---

## 🌐 API Routes (Route Handlers)

### 1. สร้าง POST API Route

```typescript
// app/api/contact/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim() || null;
    const email = (body.email || "").trim() || null;
    const message = (body.message || "").trim();

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ" },
        { status: 400 }
      );
    }
    if (!message) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อความ" },
        { status: 400 }
      );
    }

    // Insert to database
    await query(
      "INSERT INTO contacts (name, phone, email, message) VALUES (?, ?, ?, ?)",
      [name, phone, email, message]
    );

    return NextResponse.json({
      message: "บันทึกข้อความติดต่อเรียบร้อย",
    });
  } catch (e) {
    console.error("Contact save error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อความ" },
      { status: 500 }
    );
  }
}
```

**คำอธิบาย:**
- `export async function POST` คือ route handler สำหรับ POST requests
- `NextResponse.json()` ใช้สำหรับส่ง JSON response
- `status: 400` สำหรับ client errors, `status: 500` สำหรับ server errors
- ใช้ try-catch เพื่อจัดการ errors

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง API endpoint สำหรับรับข้อมูลจาก client
- เมื่อต้องการบันทึกข้อมูลลง database

---

### 2. สร้าง GET API Route

```typescript
// app/api/products/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const products = await query<Product[]>(
      "SELECT id, name, subtitle, image, price FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return NextResponse.json({ products });
  } catch (e) {
    console.error("Get products error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
```

**คำอธิบาย:**
- `export async function GET` คือ route handler สำหรับ GET requests
- `new URL(request.url)` ใช้สำหรับอ่าน query parameters
- `searchParams.get()` ใช้สำหรับดึงค่า query parameter

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง API endpoint สำหรับส่งข้อมูลไปยัง client
- เมื่อต้องการดึงข้อมูลจาก database

---

### 3. สร้าง API Route พร้อม Authentication

```typescript
// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createToken, getAuthCookieName, getAuthCookieOptions } from "@/lib/auth";

type UserRow = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  balance: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const login = (body.login || body.username || body.email || "").trim();
    const password = body.password;

    if (!login || !password) {
      return NextResponse.json(
        { error: "กรุณากรอก username หรือ email และรหัสผ่าน" },
        { status: 400 }
      );
    }

    // Find user
    const rows = await query<UserRow[]>(
      "SELECT id, username, email, password, role, balance FROM users WHERE username = ? OR email = ? LIMIT 1",
      [login, login]
    );
    const user = Array.isArray(rows) ? rows[0] : null;

    if (!user) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรืออีเมลไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      sub: String(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const res = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: Number(user.balance ?? 0),
      },
    });
    const opts = getAuthCookieOptions();
    res.cookies.set(getAuthCookieName(), token, opts);
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
```

**คำอธิบาย:**
- `bcrypt.compare()` ใช้สำหรับเปรียบเทียบ password ที่ hash แล้ว
- `createToken()` ใช้สำหรับสร้าง JWT token
- `res.cookies.set()` ใช้สำหรับตั้งค่า cookie

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง login endpoint
- เมื่อต้องการจัดการ authentication

---

## 📄 Server Components

### 1. สร้าง Server Component ที่ดึงข้อมูลจาก Database

```typescript
// app/shop/page.tsx

import { query } from "@/lib/db";
import type { Product } from "@/lib/types";

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await query<Product[]>(
      "SELECT id, name, subtitle, image, price, delivery_method FROM products ORDER BY created_at DESC"
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();
  
  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2d1b4e] text-center">
          ร้านค้า
        </h1>
        {products.length === 0 ? (
          <p className="text-center text-[#666] py-12">ยังไม่มีสินค้า</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {products.map((p) => (
              <li key={p.id}>
                {/* Render product */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**คำอธิบาย:**
- Server Component คือ component ที่รันบน server
- สามารถใช้ `async` function ได้โดยตรง
- ไม่ต้องใช้ `"use client"` directive
- ใช้ `await` เพื่อรอข้อมูลจาก database

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการดึงข้อมูลจาก database
- เมื่อไม่ต้องการ interactivity (ไม่มี state, event handlers)
- เมื่อต้องการ SEO-friendly content

---

### 2. สร้าง Server Component พร้อม Metadata

```typescript
// app/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
```

**คำอธิบาย:**
- `Metadata` type ใช้สำหรับกำหนด metadata ของหน้า
- `export const metadata` จะถูก Next.js ใช้สำหรับ SEO

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการกำหนด title, description สำหรับหน้า
- เมื่อต้องการปรับปรุง SEO

---

## 🎨 Client Components

### 1. สร้าง Client Component พื้นฐาน

```typescript
// app/components/ContactForm.tsx

"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ส่งข้อความไม่สำเร็จ");
        return;
      }
      setSuccess(data.message || "บันทึกข้อความติดต่อเรียบร้อย");
      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

**คำอธิบาย:**
- `"use client"` directive บอกว่า component นี้รันบน client
- `useState` ใช้สำหรับจัดการ state
- `React.FormEvent` คือ type สำหรับ form event
- `e.preventDefault()` ป้องกัน default form submission

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการ interactivity (state, event handlers)
- เมื่อต้องการใช้ React hooks
- เมื่อต้องการ client-side functionality

---

### 2. สร้าง Reusable UI Component

```typescript
// components/ui/button.tsx

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-muted",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**คำอธิบาย:**
- `cva` (class-variance-authority) ใช้สำหรับสร้าง component variants
- `React.forwardRef` ใช้สำหรับ forward ref ไปยัง DOM element
- `cn()` ใช้สำหรับ merge class names
- `...props` คือ spread operator สำหรับส่ง props ที่เหลือไปยัง button

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง reusable UI components
- เมื่อต้องการ component variants (เช่น size, color)
- เมื่อต้องการ type-safe component props

---

## 🔄 React Context และ Hooks

### 1. สร้าง Context Provider

```typescript
// contexts/auth-context.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user as AuthUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.user) {
          setUser(data.user as AuthUser);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
```

**คำอธิบาย:**
- `createContext` ใช้สำหรับสร้าง context
- `useState` ใช้สำหรับจัดการ state
- `useEffect` ใช้สำหรับ side effects (เช่น fetch data)
- `useCallback` ใช้สำหรับ memoize functions
- `useContext` ใช้สำหรับเข้าถึง context value

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการ share state ระหว่างหลาย components
- เมื่อต้องการจัดการ global state (เช่น authentication, cart)

---

### 2. สร้าง Custom Hook

```typescript
// lib/cart-context.tsx

"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type CartItem = {
  productId: number;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  selectedOptions?: Record<string, string>;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (productId: number, selectedOptions?: Record<string, string>) => void;
  updateQty: (productId: number, qty: number, selectedOptions?: Record<string, string>) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("mlt_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("mlt_cart", JSON.stringify(items));
    }
  }, [mounted, items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty"> & { qty?: number }) => {
      const qty = Math.max(1, item.qty ?? 1);
      setItems((prev) => {
        // Check if item already exists
        const existing = prev.find(
          (x) =>
            x.productId === item.productId &&
            JSON.stringify(x.selectedOptions || {}) === JSON.stringify(item.selectedOptions || {})
        );
        if (existing) {
          return prev.map((x) =>
            x.productId === item.productId &&
            JSON.stringify(x.selectedOptions || {}) === JSON.stringify(item.selectedOptions || {})
              ? { ...x, qty: x.qty + qty }
              : x
          );
        }
        return [...prev, { ...item, qty }];
      });
    },
    []
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, x) => sum + x.price * x.qty, 0),
    [items]
  );
  const totalItems = useMemo(() => items.reduce((sum, x) => sum + x.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      totalAmount,
      totalItems,
    }),
    [items, addItem, removeItem, updateQty, clearCart, totalAmount, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
```

**คำอธิบาย:**
- `useMemo` ใช้สำหรับ memoize ค่าที่คำนวณได้
- `localStorage` ใช้สำหรับเก็บข้อมูลใน browser
- `Record<string, string>` คือ type สำหรับ object ที่มี key และ value เป็น string

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการจัดการ state ที่ซับซ้อน
- เมื่อต้องการ persist data ใน localStorage
- เมื่อต้องการ computed values (เช่น totalAmount)

---

## 📝 Form Handling

### 1. สร้าง Form พร้อม Validation

```typescript
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "กรุณากรอกข้อความ";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ submit: data.error || "ส่งข้อความไม่สำเร็จ" });
        return;
      }
      // Success - reset form
      setFormData({ name: "", phone: "", email: "", message: "" });
      alert("ส่งข้อความสำเร็จ");
    } catch {
      setErrors({ submit: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className={errors.name ? "border-red-500" : ""}
      />
      {errors.name && <span className="text-red-500">{errors.name}</span>}
      
      {/* Other fields */}
      
      <button type="submit" disabled={loading}>
        {loading ? "กำลังส่ง..." : "ส่งข้อความ"}
      </button>
    </form>
  );
}
```

**คำอธิบาย:**
- `Record<string, string>` ใช้สำหรับเก็บ errors ของแต่ละ field
- Validation function ใช้สำหรับตรวจสอบข้อมูลก่อนส่ง
- `disabled={loading}` ป้องกันการ submit ซ้ำ

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง form ที่มี validation
- เมื่อต้องการแสดง error messages
- เมื่อต้องการจัดการ form state

---

## 🔐 Authentication

### 1. สร้าง JWT Token

```typescript
// lib/auth.ts

import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 วัน

export type JWTPayload = {
  sub: string; // user id
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function createToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const secret = getSecretKey();
  return new jose.SignJWT({
    username: payload.username,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      username: payload.username as string,
      email: payload.email as string,
      role: payload.role as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}
```

**คำอธิบาย:**
- `jose` library ใช้สำหรับสร้างและ verify JWT tokens
- `SignJWT` ใช้สำหรับสร้าง token
- `jwtVerify` ใช้สำหรับ verify token
- `Omit<JWTPayload, "iat" | "exp">` คือ type ที่ลบ `iat` และ `exp` ออก

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง authentication system
- เมื่อต้องการ secure API endpoints
- เมื่อต้องการจัดการ user sessions

---

### 2. Hash Password

```typescript
import bcrypt from "bcryptjs";

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const match = await bcrypt.compare(password, hashedPassword);
```

**คำอธิบาย:**
- `bcrypt.hash()` ใช้สำหรับ hash password
- `bcrypt.compare()` ใช้สำหรับเปรียบเทียบ password
- ควร hash password ก่อนเก็บใน database

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการเก็บ password อย่างปลอดภัย
- เมื่อต้องการ verify password

---

## 🛠️ Utilities และ Helper Functions

### 1. สร้าง Utility Function สำหรับ Class Names

```typescript
// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**คำอธิบาย:**
- `clsx` ใช้สำหรับ merge class names
- `twMerge` ใช้สำหรับ merge Tailwind classes โดยแก้ไข conflicts
- `ClassValue` คือ type จาก clsx

**ตัวอย่างการใช้งาน:**

```typescript
<button className={cn("px-4 py-2", isActive && "bg-blue-500", className)}>
  Click me
</button>
```

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการ merge class names หลายตัว
- เมื่อใช้ Tailwind CSS
- เมื่อต้องการ conditional classes

---

### 2. สร้าง API Client Function

```typescript
// lib/api.ts

const API_BASE = "";

type ApiResponse<T = unknown> =
  | { status: "success"; data: T }
  | { status: "error"; error?: string };

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { status: "error", error: (data as { error?: string }).error || res.statusText };
  }
  return { status: "success", data: data as T };
}

export const apiClient = {
  updateProfile(body: UpdateProfileRequest) {
    return request<{ user?: unknown }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  
  getBalance() {
    return request<{ money: number; points: number }>("/api/balance");
  },
};
```

**คำอธิบาย:**
- `RequestInit` คือ type สำหรับ fetch options
- `credentials: "include"` ใช้สำหรับส่ง cookies
- Generic function `<T>` ใช้สำหรับกำหนด return type

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการสร้าง reusable API client
- เมื่อต้องการ type-safe API calls
- เมื่อต้องการจัดการ errors แบบ consistent

---

## ⚠️ Error Handling

### 1. Error Handling ใน API Routes

```typescript
export async function POST(request: Request) {
  try {
    // Your code here
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
```

**คำอธิบาย:**
- `try-catch` ใช้สำหรับจัดการ errors
- `console.error` ใช้สำหรับ log errors
- ส่ง error response กลับไปยัง client

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการจัดการ errors ใน API routes
- เมื่อต้องการป้องกัน server crashes

---

### 2. Error Handling ใน Components

```typescript
"use client";

import { useState } from "react";

export default function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/endpoint");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }
      // Success
    } catch (e) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <button onClick={handleAction} disabled={loading}>
        {loading ? "กำลังโหลด..." : "ดำเนินการ"}
      </button>
    </div>
  );
}
```

**คำอธิบาย:**
- ใช้ state เพื่อเก็บ error message
- แสดง error message ให้ผู้ใช้เห็น
- `finally` block จะรันเสมอ

**เมื่อไหร่ควรใช้:**
- เมื่อต้องการแสดง error messages ให้ผู้ใช้เห็น
- เมื่อต้องการจัดการ errors ใน client components

---

## 📚 สรุป

### Patterns ที่ใช้บ่อยที่สุด:

1. **Types และ Interfaces** - สำหรับ type safety
2. **Database Queries** - สำหรับดึงข้อมูลจาก database
3. **API Routes** - สำหรับสร้าง API endpoints
4. **Server Components** - สำหรับดึงข้อมูลและ render บน server
5. **Client Components** - สำหรับ interactivity
6. **Context และ Hooks** - สำหรับจัดการ global state
7. **Form Handling** - สำหรับจัดการ forms
8. **Authentication** - สำหรับจัดการ user authentication
9. **Utilities** - สำหรับ helper functions
10. **Error Handling** - สำหรับจัดการ errors

---

**อัปเดตล่าสุด:** กุมภาพันธ์ 2026
