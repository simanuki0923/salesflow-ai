import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import AppShell from "@/components/layout/AppShell";

import type {
  AuthUser,
} from "@/lib/api/auth";

import {
  getCurrentUser,
} from "@/lib/api/auth";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

/**
 * App Routerのlayoutへ渡されるProps。
 *
 * childrenには現在アクセスしているページの
 * Reactコンポーネントが自動的に渡される。
 */
type AppLayoutProps = {
  children: ReactNode;
};

/**
 * /dashboard
 * /customers
 * /projects
 *
 * など、(app)配下のすべての画面へ、
 *
 * ・Authentication Check
 * ・Login User取得
 * ・AppShell
 *
 * を共通適用するLayout。
 *
 * (app)はRoute Groupのため、
 * 実際のURLには「(app)」は含まれない。
 */
export default async function AppLayout({
  children,
}: AppLayoutProps) {
  /**
   * BrowserからNext.jsへ送信された
   * Laravel Session Cookieを取得する。
   *
   * Next.js Server ComponentからLaravelへ
   * Requestする場合、
   * Browser Cookieは自動転送されないため、
   * getServerAuthRequestInit()で
   * Cookie Headerを組み立てる。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Headerなどでも利用するため、
   * Login User情報を保持する。
   */
  let user: AuthUser;

  try {
    /**
     * Laravelの、
     *
     * GET /api/v1/me
     *
     * を呼び出して、
     * 現在のSessionが有効か確認する。
     *
     * Sessionが有効なら
     * Login User情報が返される。
     */
    user =
      await getCurrentUser(
        authInit,
      );
  } catch (error) {
    /**
     * Laravelから401 Unauthorizedが返った場合。
     *
     * ・未Login
     * ・Session期限切れ
     * ・Session Cookieが無効
     *
     * などが考えられるため、
     * Login画面へRedirectする。
     */
    if (
      error instanceof ApiError &&
      error.status === 401
    ) {
      redirect(
        "/login",
      );
    }

    /**
     * 401以外はAuthentication Errorとは
     * 限らない。
     *
     * 例えば、
     *
     * ・Laravel Server停止
     * ・Network Error
     * ・500 Internal Server Error
     *
     * などをLogin画面へRedirectすると、
     * 本当のError原因が分からなくなる。
     *
     * そのため401以外は
     * Next.js側のError処理へ渡す。
     */
    throw error;
  }

  /**
   * Authentication成功後だけ
   * Login後画面を表示する。
   *
   * Laravelから取得したUser情報を
   * AppShellへ渡し、
   * そこからHeaderへ渡す。
   */
  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}