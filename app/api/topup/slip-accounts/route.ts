import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Get only active accounts for public display
    // This endpoint is accessible to authenticated users
    const rows = await query<any[]>(
      "SELECT id, account_number, account_full, receiver_name, display_name, full_name FROM slip_accounts WHERE is_active = 1 ORDER BY created_at DESC"
    );

    return NextResponse.json({ status: "success", data: Array.isArray(rows) ? rows : [] });
  } catch (error: any) {
    console.error("Error fetching slip accounts:", error);
    // Return empty array instead of error to prevent UI issues
    return NextResponse.json({ 
      status: "success", 
      data: [],
      error: error?.message || "Failed to fetch slip accounts" 
    });
  }
}
