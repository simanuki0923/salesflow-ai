import {
  apiRequest,
  frontendRequest,
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

  /**
   * BackendのUserResourceが判定した
   * 公開Demo Accountかどうか。
   */
  isDemo: boolean;

  /**
   * Demo Accountの書き込み操作を
   * 無効化するかどうか。
   */
  isReadOnly: boolean;
};

/**
 * Login時に送信するData。
 */
export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};

/**
 * Next.js Route Handler経由でLoginする。
 *
 * Laravelが発行したPersonal Access Tokenは
 * Browser JavaScriptへ返さず、
 * Next.js側でHttpOnly Cookieへ保存する。
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response =
    await frontendRequest<
      ApiResourceResponse<AuthUser>
    >(
      "/api/auth/login",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            email:
              credentials.email,

            password:
              credentials.password,

            remember:
              credentials.remember ??
              false,
          }),
      },
    );

  return response.data;
}

/**
 * 現在Login中のUserを取得する。
 *
 * Server Componentでは
 * getServerAuthRequestInit()でBearer Tokenを渡す。
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
 * Laravel Personal Access Tokenを失効し、
 * Next.js側HttpOnly Cookieを削除する。
 */
export async function logout(): Promise<void> {
  await frontendRequest<void>(
    "/api/auth/logout",
    {
      method:
        "POST",
    },
  );
}
