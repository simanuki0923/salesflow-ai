import type {
  ApiErrorResponse,
  ApiValidationErrors,
} from "@/lib/api/types";

/**
 * Laravel Backend本体のURL。
 *
 * /login
 * /logout
 * /sanctum/csrf-cookie
 *
 * など、/api/v1配下ではないEndpointにも使用する。
 */
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

/**
 * Laravel REST APIのBase URL。
 *
 * Customer / Project / me等は
 *
 * /api/v1
 *
 * 配下にあるためこちらを使用する。
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/$/, "");

/**
 * CSRF Token送信を必要としないHTTP Method。
 */
const SAFE_HTTP_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

/**
 * Laravel APIからエラーが返った場合に
 * 使用する独自Error Class。
 *
 * HTTP StatusやValidation Errorを
 * React Component側でも利用できる。
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
 * Browser Cookieから指定Cookieの値を取得する。
 *
 * Laravel Sanctumでは、
 *
 * XSRF-TOKEN Cookie
 *
 * の値を、
 *
 * X-XSRF-TOKEN Header
 *
 * としてPOST / PATCH / DELETE等のRequest時に
 * Laravelへ送り返してCSRF検証を行う。
 *
 * Server Componentではdocumentが存在しないため、
 * nullを返す。
 */
function getBrowserCookie(
  name: string,
): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;

  const cookie = document.cookie
    .split("; ")
    .find((value) =>
      value.startsWith(prefix),
    );

  if (cookie === undefined) {
    return null;
  }

  /**
   * XSRF-TOKEN CookieはURL Encodeされているため、
   * Headerへ設定する前にDecodeする。
   */
  return decodeURIComponent(
    cookie.slice(prefix.length),
  );
}

/**
 * LaravelへHTTP Requestする共通処理。
 *
 * Browserから実行するときは、
 * Laravel Session Cookieを送受信するため
 * credentials: "include"を使用する。
 */
async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(init.headers);

  /**
   * LaravelへJSON Responseを要求する。
   *
   * Validation ErrorやAuthentication Errorも
   * HTMLではなくJSONで受け取る。
   */
  headers.set(
    "Accept",
    "application/json",
  );

  /**
   * Bodyが存在するRequestだけ
   * Content-TypeをJSONにする。
   */
  if (
    init.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const method = (
    init.method ?? "GET"
  ).toUpperCase();

  /**
   * BrowserからのPOST / PATCH / PUT / DELETEでは、
   * SanctumのXSRF-TOKEN Cookieを
   * X-XSRF-TOKEN Headerへ設定する。
   *
   * Server Componentではwindowが存在しないため、
   * Browser実行時だけこの処理を行う。
   */
  if (
    typeof window !== "undefined" &&
    !SAFE_HTTP_METHODS.has(method) &&
    !headers.has("X-XSRF-TOKEN")
  ) {
    const xsrfToken =
      getBrowserCookie(
        "XSRF-TOKEN",
      );

    if (xsrfToken !== null) {
      headers.set(
        "X-XSRF-TOKEN",
        xsrfToken,
      );
    }
  }

  const response = await fetch(
    url,
    {
      ...init,

      headers,

      /**
       * localhost:3000
       * ↓
       * localhost:8000
       *
       * のCross Origin通信でも
       * Laravel Session Cookieを送受信する。
       */
      credentials: "include",

      /**
       * CRMでは更新直後に
       * 最新Database状態を表示したいため、
       * Cacheしない。
       */
      cache: "no-store",
    },
  );

  /**
   * DELETE成功時やCSRF Cookie取得時など、
   * HTTP 204にはResponse Bodyが存在しない。
   */
  if (response.status === 204) {
    return undefined as T;
  }

  /**
   * HTTP Errorの場合。
   */
  if (!response.ok) {
    let errorBody: ApiErrorResponse = {};

    try {
      errorBody =
        (await response.json()) as ApiErrorResponse;
    } catch {
      /**
       * JSONではないError Responseの場合は
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

  return (await response.json()) as T;
}

/**
 * /api/v1配下のLaravel REST APIへRequestする。
 *
 * 例:
 *
 * /customers
 * /projects
 * /me
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(
    `${API_BASE_URL}${path}`,
    init,
  );
}

/**
 * Laravel Backend本体へRequestする。
 *
 * Sanctum Authenticationで使用する、
 *
 * /sanctum/csrf-cookie
 * /login
 * /logout
 *
 * は/api/v1配下ではないため、
 * API_BASE_URLとは分離している。
 */
export async function backendRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(
    `${BACKEND_URL}${path}`,
    init,
  );
}