import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { query, withTransaction } from "@/lib/db";

// Extract last 4 digits from account number
function extractLast4Digits(account: string): string {
  // Remove all non-digit characters
  const digits = account.replace(/\D/g, "");
  // Return last 4 digits
  return digits.slice(-4);
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const rows = await query<any[]>(
      "SELECT * FROM slip_accounts ORDER BY created_at DESC"
    );

    return NextResponse.json({ status: "success", data: rows });
  } catch (error) {
    console.error("Error fetching slip accounts:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch slip accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      account_number,
      account_full,
      receiver_name,
      display_name,
      full_name,
      is_active = true,
    } = body;

    if (!account_number || !receiver_name) {
      return NextResponse.json(
        { status: "error", error: "account_number and receiver_name are required" },
        { status: 400 }
      );
    }

    // Extract last 4 digits
    const accountLast4 = extractLast4Digits(account_number);

    // Check if account already exists
    const existing = await query<any[]>(
      "SELECT id FROM slip_accounts WHERE account_number = ?",
      [accountLast4]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { status: "error", error: "Account number already exists" },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `INSERT INTO slip_accounts 
       (account_number, account_full, receiver_name, display_name, full_name, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        accountLast4,
        account_full || account_number,
        receiver_name,
        display_name || null,
        full_name || null,
        is_active ? 1 : 0,
      ]
    );

    return NextResponse.json({
      status: "success",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating slip account:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to create slip account" },
      { status: 500 }
    );
  }
}
