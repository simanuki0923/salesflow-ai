import {
  apiRequest,
  backendRequest,
} from "@/lib/api/client";

import type {
  ApiResourceResponse,
} from "@/lib/api/types";

/**
 * Laravel UserResourceが返す
 * Login User情報。
 */
export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

/**
 * Login時にLaravelへ送信するData。
 */
export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};

/**
 * SanctumのCSRF Cookieを取得する。
 *
 * Login / Logout等の
 * State-changing Requestを送る前に実行する。
 */
export async function initializeCsrf(): Promise<void> {
  await backendRequest<void>(
    "/sanctum/csrf-cookie",
  );
}

/**
 * Laravel Session AuthenticationでLoginする。
 *
 * 1. CSRF Cookie取得
 * 2. POST /login
 * 3. Laravel Session Cookie取得
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  await initializeCsrf();

  const response =
    await backendRequest<
      ApiResourceResponse<AuthUser>
    >(
      "/login",
      {
        method: "POST",

        body: JSON.stringify({
          email:
            credentials.email,

          password:
            credentials.password,

          remember:
            credentials.remember ?? false,
        }),
      },
    );

  return response.data;
}

/**
 * 現在Login中のUserを取得する。
 *
 * RequestInitを受け取れるようにしておくことで、
 * BrowserだけでなくNext.js Server Componentからも
 * Cookie Headerを渡して利用できる。
 */
export async function getCurrentUser(
  init: RequestInit = {},
): Promise<AuthUser> {
  const response =
    await apiRequest<
      ApiResourceResponse<AuthUser>
    >(
      "/me",
      init,
    );

  return response.data;
}

/**
 * Laravel SessionからLogoutする。
 */
export async function logout(): Promise<void> {
  /**
   * XSRF-TOKENが期限切れ・未取得の場合にも
   * Logout Requestを送れるように
   * CSRF Cookieを更新してから実行する。
   */
  await initializeCsrf();

  await backendRequest<void>(
    "/logout",
    {
      method: "POST",
    },
  );
}