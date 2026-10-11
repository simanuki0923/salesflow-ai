import "server-only";

import {
  cookies,
} from "next/headers";

/**
 * Next.js Frontend URL。
 *
 * Laravel Sanctumへ
 * First Party SPAからのRequestであることを
 * 示すためOrigin / Refererとして利用する。
 */
const FRONTEND_URL = (
  process.env.NEXT_PUBLIC_FRONTEND_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Next.js Server ComponentからLaravelへ
 * Authentication情報を転送するための
 * RequestInitを生成する。
 *
 * Browser
 *   ↓ Cookie
 * Next.js Server
 *   ↓ Cookie Header
 * Laravel
 *
 * という流れを作る。
 */
export async function getServerAuthRequestInit(): Promise<RequestInit> {
  const cookieStore =
    await cookies();

  /**
   * BrowserからNext.jsへ送信されたCookieを
   * Laravelへ転送できる形式へ組み直す。
   *
   * laravel_sessionのようなHttpOnly Cookieも
   * Server側のcookies()では取得できる。
   */
  const cookieHeader = cookieStore
    .getAll()
    .map(
      ({ name, value }) =>
        `${name}=${value}`,
    )
    .join("; ");

  const headers =
    new Headers();

  if (cookieHeader !== "") {
    headers.set(
      "Cookie",
      cookieHeader,
    );
  }

  /**
   * Laravel Sanctumへ
   * localhost:3000からのRequestであることを伝える。
   */
  headers.set(
    "Origin",
    FRONTEND_URL,
  );

  headers.set(
    "Referer",
    `${FRONTEND_URL}/`,
  );

  return {
    headers,
  };
}