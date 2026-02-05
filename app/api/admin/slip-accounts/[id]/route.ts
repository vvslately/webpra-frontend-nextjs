import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { query } from "@/lib/db";

// Extract last 4 digits from account number
function extractLast4Digits(account: string): string {
  const digits = account.replace(/\D/g, "");
  return digits.slice(-4);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const {
      account_number,
      account_full,
      receiver_name,
      display_name,
      full_name,
      is_active,
    } = body;

    // Extract last 4 digits if account_number is provided
    let accountLast4: string | undefined;
    if (account_number) {
      accountLast4 = extractLast4Digits(account_number);
      
      // Check if account already exists (excluding current record)
      const existing = await query<any[]>(
        "SELECT id FROM slip_accounts WHERE account_number = ? AND id != ?",
        [accountLast4, id]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { status: "error", error: "Account number already exists" },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (accountLast4 !== undefined) {
      updates.push("account_number = ?");
      values.push(accountLast4);
    }
    if (account_full !== undefined) {
      updates.push("account_full = ?");
      values.push(account_full);
    }
    if (receiver_name !== undefined) {
      updates.push("receiver_name = ?");
      values.push(receiver_name);
    }
    if (display_name !== undefined) {
      updates.push("display_name = ?");
      values.push(display_name);
    }
    if (full_name !== undefined) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { status: "error", error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);

    await query(
      `UPDATE slip_accounts SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error updating slip account:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to update slip account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    await query("DELETE FROM slip_accounts WHERE id = ?", [id]);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error deleting slip account:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to delete slip account" },
      { status: 500 }
    );
  }
}
