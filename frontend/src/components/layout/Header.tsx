"use client";

import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  AuthUser,
} from "@/lib/api/auth";

import {
  logout,
} from "@/lib/api/auth";

/**
 * Headerへ渡すProps。
 */
type HeaderProps = {
  user: AuthUser;
};

/**
 * Login後画面の共通Header。
 *
 * Laravelから取得したLogin User情報を表示し、
 * Logout処理も担当する。
 */
export default function Header({
  user,
}: HeaderProps) {
  const router =
    useRouter();

  const [
    isUserMenuOpen,
    setIsUserMenuOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    logoutError,
    setLogoutError,
  ] = useState("");

  /**
   * User名の先頭1文字を
   * Avatarとして表示する。
   *
   * 名前が空の場合はUを表示する。
   */
  const initial =
    Array.from(
      user.name.trim(),
    )[0] ?? "U";

  /**
   * Logout処理。
   *
   * GET /sanctum/csrf-cookie
   * ↓
   * POST /logout
   * ↓
   * Laravel Session破棄
   * ↓
   * /login
   */
  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logout();

      /**
       * Logout後はLogin画面へ移動する。
       */
      router.replace(
        "/login",
      );

      /**
       * Server Component側も再評価して、
       * Logout後のSession状態を反映する。
       */
      router.refresh();
    } catch {
      /**
       * Logout失敗時はUserへ通知する。
       *
       * Session状態が不明なため、
       * 自動的にLogin画面へ移動させない。
       */
      setLogoutError(
        "ログアウトに失敗しました。もう一度お試しください。",
      );

      setIsLoggingOut(false);
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[88px] border-b border-slate-200 bg-white lg:left-[260px]">
      <div className="flex h-full items-center justify-between gap-6 px-6 lg:px-8">
        {/* 全体検索欄 */}
        <div className="hidden w-full max-w-[510px] md:block">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              placeholder="顧客・案件・タスクを検索..."
              className="h-12 w-full rounded-xl border border-slate-200 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Header右側 */}
        <div className="ml-auto flex items-center gap-4">
          {/* 通知機能は今後Laravel APIと接続する */}
          <button
            type="button"
            aria-label="通知"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <Bell size={21} />
          </button>

          {/* Login User Menu */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={isUserMenuOpen}
              onClick={() =>
                setIsUserMenuOpen(
                  (current) =>
                    !current,
                )
              }
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                {initial}
              </div>

              {/* User情報 */}
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
                  {user.name}
                </p>

                <p className="max-w-40 truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              <ChevronDown
                size={17}
                className={`text-slate-500 transition ${
                  isUserMenuOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {/* MobileでもUser情報が確認できる */}
                <div className="border-b border-slate-100 px-3 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>

                {logoutError !== "" && (
                  <p
                    role="alert"
                    className="mx-2 mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                  >
                    {logoutError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut
                    size={18}
                  />

                  {isLoggingOut
                    ? "ログアウト中..."
                    : "ログアウト"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}