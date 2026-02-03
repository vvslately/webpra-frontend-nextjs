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

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
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
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
