import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken, getAuthCookieName } from "@/lib/auth";

// Extract last 4 digits from account number
function extractLast4Digits(account: string): string {
  const digits = account.replace(/\D/g, "");
  return digits.slice(-4);
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value;
    if (!token) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.sub) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiver_account, receiver_name, amount, trans_ref } = body;

    if (!receiver_account || !amount) {
      return NextResponse.json(
        { status: "error", error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract last 4 digits from receiver account
    const receiverAccountLast4 = extractLast4Digits(receiver_account);

    // Check if trans_ref already exists and is verified (prevent duplicate topup)
    // Only check for verified status, not pending status
    if (trans_ref) {
      const existing = await query<any[]>(
        "SELECT id, status FROM slip_verifications WHERE trans_ref = ? AND status = 'verified'",
        [trans_ref]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          {
            status: "error",
            error: "สลิปนี้ถูกใช้เติมเงินแล้ว",
            code: "DUPLICATE_TRANS_REF",
          },
          { status: 400 }
        );
      }
    }

    // Get all active accounts
    const allAccounts = await query<any[]>(
      `SELECT * FROM slip_accounts WHERE is_active = 1`
    );

    if (allAccounts.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          error: "ไม่พบการตั้งค่าบัญชี",
          code: "NO_ACCOUNTS_CONFIGURED",
        },
        { status: 404 }
      );
    }

    // Check if account number matches (last 4 digits) OR receiver name matches
    // Match if EITHER account_number matches OR receiver_name matches
    const matchingAccount = allAccounts.find(
      (acc) => acc.account_number === receiverAccountLast4
    );

    const matchingName = receiver_name
      ? allAccounts.find((acc) => acc.receiver_name === receiver_name)
      : null;

    // Must match at least one: account number OR receiver name
    if (!matchingAccount && !matchingName) {
      return NextResponse.json(
        {
          status: "error",
          error: "บัญชีหรือชื่อไม่ตรงกับสลิป",
          code: "ACCOUNT_MISMATCH",
        },
        { status: 400 }
      );
    }

    // Use the matching account (prefer account number match)
    const account = matchingAccount || matchingName;

    return NextResponse.json({
      status: "success",
      data: {
        verified: true,
        account: account,
        full_name: account.full_name || account.display_name || account.receiver_name,
        amount: amount,
      },
    });
  } catch (error) {
    console.error("Error verifying slip:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to verify slip" },
      { status: 500 }
    );
  }
}
