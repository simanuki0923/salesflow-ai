import type {
  ApiErrorResponse,
  ApiValidationErrors,
} from "@/lib/api/types";

/**
 * Laravel REST APIのBase URL。
 *
 * Server ComponentではLaravelへ直接接続する。
 *
 * BrowserではNext.js API Proxyを経由するため、
 * LaravelのURLをBrowserへ直接Requestしない。
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/$/, "");

/**
 * Laravel APIからエラーが返った場合に
 * 使用する独自Error Class。
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly validationErrors:
      ApiValidationErrors = {},
  ) {
    super(message);

    this.name = "ApiError";
  }
}

/**
 * HTTP Request共通処理。
 */
async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(init.headers);

  headers.set(
    "Accept",
    "application/json",
  );

  if (
    init.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response =
    await fetch(
      url,
      {
        ...init,

        headers,

        /**
         * BrowserからNext.jsへ
         * HttpOnly Authentication Cookieを送信する。
         */
        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  if (!response.ok) {
    let errorBody:
      ApiErrorResponse = {};

    try {
      errorBody =
        await response.json() as
          ApiErrorResponse;
    } catch {
      /**
       * JSON以外のError Responseでは
       * Default Messageを使用する。
       */
    }

    throw new ApiError(
      response.status,

      errorBody.message ??
        `API request failed: ${response.status}`,

      errorBody.errors ?? {},
    );
  }

  return await response.json() as T;
}

/**
 * Laravel REST APIへRequestする。
 *
 * Browser:
 *
 * /api/backend/...
 * ↓
 * Next.js Route Handler
 * ↓ Bearer Token
 * Laravel
 *
 * Server Component:
 *
 * Next.js Server
 * ↓ Bearer Token
 * Laravel
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url =
    typeof window === "undefined"
      ? `${API_BASE_URL}${path}`
      : `/api/backend${path}`;

  return request<T>(
    url,
    init,
  );
}

/**
 * Next.js自身のRoute HandlerへRequestする。
 *
 * Login / Logout等に使用する。
 */
export async function frontendRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(
    path,
    init,
  );
}
