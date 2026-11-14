import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-cookie";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const token =
    request.cookies.get(
      AUTH_TOKEN_COOKIE_NAME,
    )?.value;

  /**
   * Laravel側Tokenの失効を試みる。
   *
   * Network Error等が発生しても
   * Browser側Cookieは必ず削除する。
   */
  if (
    token !== undefined &&
    token !== ""
  ) {
    try {
      await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          cache:
            "no-store",
        },
      );
    } catch {
      /**
       * Local Cookie削除は
       * Backend通信失敗時も実行する。
       */
    }
  }

  const response =
    new NextResponse(
      null,
      {
        status: 204,
      },
    );

  response.cookies.delete(
    AUTH_TOKEN_COOKIE_NAME,
  );

  return response;
}
