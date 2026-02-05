import { NextRequest, NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken, getAuthCookieName } from "@/lib/auth";

const SLIP_VERIFY_API_URL = "https://suba.rdcw.co.th/v2/inquiry";
const CLIENT_ID = process.env.SLIP_VERIFY_CLIENT_ID || "en78zieunia09j1t";
const CLIENT_SECRET = process.env.SLIP_VERIFY_CLIENT_SECRET || "h77coiaar1mg1nrgrvnvdcrt497u4tof";

// Create base64 encoded auth header
// Format: base64(clientId:clientSecret)
const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

// Extract last 4 digits from account number
function extractLast4Digits(account: string): string {
  const digits = account.replace(/\D/g, "");
  return digits.slice(-4);
}

// Get user ID from session
async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload?.sub ? parseInt(payload.sub, 10) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let body: FormData | Blob | string | null = null;
    const headers: HeadersInit = {
      Authorization: `Basic ${authString}`,
    };

    // Handle different content types
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const newFormData = new FormData();
      const file = formData.get("file") as File | null;
      if (file) {
        newFormData.append("file", file);
      } else {
        formData.forEach((value, key) => {
          newFormData.append(key, value);
        });
      }
      body = newFormData;
    } else if (contentType.includes("application/json")) {
      const jsonData = await request.json();
      body = JSON.stringify(jsonData);
      headers["Content-Type"] = "application/json";
    } else if (contentType.startsWith("image/")) {
      body = await request.blob();
      headers["Content-Type"] = contentType;
    } else {
      return NextResponse.json(
        {
          code: 1000,
          message: "Missing or invalid Content-Type header",
        },
        { status: 400 }
      );
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        ...headers,
        // Ensure Authorization header is set correctly
        Authorization: `Basic ${authString}`,
      },
      body: body as BodyInit,
    };

    // Debug: Log auth info (remove in production)
    console.log("Slip Verify API Request:", {
      url: SLIP_VERIFY_API_URL,
      hasAuth: !!authString,
      contentType: contentType,
      clientId: CLIENT_ID.substring(0, 5) + "...",
    });

    // Call Slip Verify API
    const response = await fetch(SLIP_VERIFY_API_URL, fetchOptions);
    const responseData = await response.json().catch(() => ({}));

    // Debug: Log response
    if (!response.ok) {
      console.error("Slip Verify API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
    }

    // Save verification record if valid response
    if (response.ok && responseData.valid && responseData.data) {
      try {
        const userId = await getUserId();
        const data = responseData.data;
        const transRef = data.transRef || responseData.discriminator;

        if (transRef) {
          // Check if trans_ref already exists
          const existing = await query<any[]>(
            "SELECT id FROM slip_verifications WHERE trans_ref = ?",
            [transRef]
          );

          if (existing.length === 0) {
            // Extract account numbers (last 4 digits)
            const senderAccount = data.sender?.account?.value
              ? extractLast4Digits(data.sender.account.value)
              : null;
            const receiverAccount = data.receiver?.account?.value
              ? extractLast4Digits(data.receiver.account.value)
              : null;

            await query(
              `INSERT INTO slip_verifications 
               (trans_ref, discriminator, valid, amount, sender_name, sender_account, 
                receiver_name, receiver_display_name, receiver_account, trans_date, trans_time, 
                raw_data, user_id, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                transRef,
                responseData.discriminator || null,
                responseData.valid ? 1 : 0,
                data.amount || 0,
                data.sender?.name || null,
                senderAccount,
                data.receiver?.name || null,
                data.receiver?.displayName || null,
                receiverAccount,
                data.transDate || null,
                data.transTime || null,
                JSON.stringify(responseData),
                userId,
                "pending",
              ]
            );
          }
        }
      } catch (dbError) {
        console.error("Error saving slip verification:", dbError);
        // Don't fail the request if DB save fails
      }
    }

    // Return the response with original status code
    // If unauthorized, return proper error format
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        {
          code: responseData.code || 1001,
          message: responseData.message || "Unauthorized - Please check your credentials or IP whitelist",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Slip Verify API Error:", error);
    return NextResponse.json(
      {
        code: 2001,
        message: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
