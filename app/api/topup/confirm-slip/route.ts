import { NextRequest, NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
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

    const userId = parseInt(payload.sub, 10);
    const body = await request.json();
    const { receiver_account, receiver_name, amount, trans_ref, slip_data } = body;

    if (!receiver_account || !amount || !trans_ref) {
      return NextResponse.json(
        { status: "error", error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract last 4 digits from receiver account
    const receiverAccountLast4 = extractLast4Digits(receiver_account);

    return await withTransaction(async (conn) => {
      // Check if trans_ref already exists (prevent duplicate)
      const [existing] = await conn.execute<any[]>(
        "SELECT id, status FROM slip_verifications WHERE trans_ref = ?",
        [trans_ref]
      );

      if (existing.length > 0) {
        const existingRecord = existing[0];
        if (existingRecord.status === "verified") {
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

      // Check against slip_accounts
      const [accounts] = await conn.execute<any[]>(
        `SELECT * FROM slip_accounts 
         WHERE is_active = 1 
         AND (account_number = ? OR receiver_name = ?)`,
        [receiverAccountLast4, receiver_name || ""]
      );

      if (accounts.length === 0) {
        return NextResponse.json(
          {
            status: "error",
            error: "ไม่พบบัญชีที่ตรงกับสลิป",
            code: "ACCOUNT_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      // Check if account number matches (last 4 digits) OR receiver name matches
      const matchingAccount = accounts.find(
        (acc) => acc.account_number === receiverAccountLast4
      );

      const matchingName = receiver_name
        ? accounts.find((acc) => acc.receiver_name === receiver_name)
        : null;

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

      // Update slip verification status
      if (existing.length > 0) {
        await conn.execute(
          `UPDATE slip_verifications 
           SET status = 'verified', user_id = ?, updated_at = NOW() 
           WHERE trans_ref = ?`,
          [userId, trans_ref]
        );
      } else {
        // Create new verification record if not exists
        await conn.execute(
          `INSERT INTO slip_verifications 
           (trans_ref, valid, amount, receiver_name, receiver_account, raw_data, user_id, status) 
           VALUES (?, 1, ?, ?, ?, ?, ?, 'verified')`,
          [
            trans_ref,
            amount,
            receiver_name || null,
            receiverAccountLast4,
            slip_data ? JSON.stringify(slip_data) : null,
            userId,
          ]
        );
      }

      // Add balance to user
      const [userResult] = await conn.execute<any[]>(
        "SELECT balance FROM users WHERE id = ?",
        [userId]
      );

      if (userResult.length === 0) {
        return NextResponse.json(
          { status: "error", error: "User not found" },
          { status: 404 }
        );
      }

      const currentBalance = parseFloat(userResult[0].balance || "0");
      const newBalance = currentBalance + parseFloat(String(amount));

      await conn.execute(
        "UPDATE users SET balance = ?, updated_at = NOW() WHERE id = ?",
        [newBalance, userId]
      );

      // Create topup record (if you have a topups table)
      // This depends on your existing topup system structure
      try {
        await conn.execute(
          `INSERT INTO topups (user_id, amount, status, method, transaction_ref, created_at) 
           VALUES (?, ?, 'success', 'slip', ?, NOW())`,
          [userId, amount, trans_ref]
        );
      } catch (topupError) {
        // If topups table doesn't exist, just log the error
        console.warn("Could not create topup record:", topupError);
      }

      return NextResponse.json({
        status: "success",
        data: {
          amount_added: amount,
          new_balance: newBalance,
          trans_ref: trans_ref,
        },
      });
    });
  } catch (error) {
    console.error("Error confirming slip topup:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to confirm topup" },
      { status: 500 }
    );
  }
}
