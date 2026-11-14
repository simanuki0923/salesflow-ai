import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-cookie";

/**
 * Laravel REST APIのBase URL。
 *
 * Local:
 * http://localhost:8000/api/v1
 *
 * Production:
 * RailwayのService Domain + /api/v1
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/$/, "");

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

/**
 * BrowserからのAPI Requestを
 * Next.js Server経由でLaravelへ転送する。
 *
 * Browser JavaScriptへBearer Tokenを公開せず、
 * HttpOnly CookieからTokenを読み取って
 * Authorization Headerへ設定する。
 */
async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const {
    path,
  } = await context.params;

  const token =
    request.cookies.get(
      AUTH_TOKEN_COOKIE_NAME,
    )?.value;

  if (
    token === undefined ||
    token === ""
  ) {
    return NextResponse.json(
      {
        message:
          "Unauthenticated.",
      },
      {
        status: 401,
      },
    );
  }

  const backendPath =
    path
      .map(
        (segment) =>
          encodeURIComponent(segment),
      )
      .join("/");

  const backendUrl =
    `${API_BASE_URL}/${backendPath}${request.nextUrl.search}`;

  const headers =
    new Headers();

  headers.set(
    "Accept",
    "application/json",
  );

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  const contentType =
    request.headers.get(
      "Content-Type",
    );

  if (contentType !== null) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  const method =
    request.method.toUpperCase();

  let body:
    ArrayBuffer | undefined;

  if (
    method !== "GET" &&
    method !== "HEAD"
  ) {
    const requestBody =
      await request.arrayBuffer();

    if (requestBody.byteLength > 0) {
      body = requestBody;
    }
  }

  try {
    const backendResponse =
      await fetch(
        backendUrl,
        {
          method,
          headers,
          body,
          cache: "no-store",
        },
      );

    const responseHeaders =
      new Headers();

    const responseContentType =
      backendResponse.headers.get(
        "Content-Type",
      );

    if (
      responseContentType !== null
    ) {
      responseHeaders.set(
        "Content-Type",
        responseContentType,
      );
    }

    const responseBody =
      backendResponse.status === 204
        ? null
        : await backendResponse.arrayBuffer();

    const response =
      new NextResponse(
        responseBody,
        {
          status:
            backendResponse.status,

          headers:
            responseHeaders,
        },
      );

    /**
     * Token期限切れ・失効済みの場合は、
     * Next.js側の古いCookieも削除する。
     */
    if (
      backendResponse.status === 401
    ) {
      response.cookies.delete(
        AUTH_TOKEN_COOKIE_NAME,
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Backend server is unavailable.",
      },
      {
        status: 502,
      },
    );
  }
}

export const GET =
  proxyRequest;

export const POST =
  proxyRequest;

export const PUT =
  proxyRequest;

export const PATCH =
  proxyRequest;

export const DELETE =
  proxyRequest;
