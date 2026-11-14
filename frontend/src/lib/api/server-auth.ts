import "server-only";

import {
  cookies,
} from "next/headers";

import {
  AUTH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-cookie";

/**
 * Next.js Server ComponentからLaravelへ
 * Bearer Token Authenticationを渡す。
 *
 * Browser
 *   ↓ HttpOnly Cookie
 * Next.js Server
 *   ↓ Authorization: Bearer ...
 * Laravel Sanctum
 *
 * という流れで認証する。
 */
export async function getServerAuthRequestInit(): Promise<RequestInit> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      AUTH_TOKEN_COOKIE_NAME,
    )?.value;

  const headers =
    new Headers();

  if (
    token !== undefined &&
    token !== ""
  ) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  return {
    headers,
  };
}
