import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import {
  createToken,
  getAuthCookieName,
  getAuthCookieOptions,
} from "@/lib/auth";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: string;
};

const BCRYPT_ROUNDS = 10;
const USERNAME_MIN = 2;
const USERNAME_MAX = 50;
const PASSWORD_MIN = 6;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password;
    const confirmPassword = body.confirmPassword ?? body.confirm_password;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน" },
        { status: 400 }
      );
    }

    if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
      return NextResponse.json(
        { error: `ชื่อผู้ใช้ต้องมี ${USERNAME_MIN}-${USERNAME_MAX} ตัวอักษร` },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (password.length < PASSWORD_MIN) {
      return NextResponse.json(
        { error: `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN} ตัวอักษร` },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน" },
        { status: 400 }
      );
    }

    const existing = await query<UserRow[]>(
      "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );
    const found = Array.isArray(existing) ? existing[0] : null;
    if (found) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรืออีเมลนี้มีผู้ใช้แล้ว" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')",
      [username, email, hashedPassword]
    );

    const rows = await query<UserRow[]>(
      "SELECT id, username, email, role, balance FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) {
      return NextResponse.json(
        { error: "สมัครสำเร็จ แต่โหลดข้อมูลไม่ได้ กรุณาเข้าสู่ระบบ" },
        { status: 500 }
      );
    }

    const token = await createToken({
      sub: String(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
    });

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
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}
