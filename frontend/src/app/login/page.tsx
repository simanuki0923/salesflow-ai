"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ApiError,
} from "@/lib/api/client";

import {
  login,
} from "@/lib/api/auth";

/**
 * SalesFlow AI Login画面。
 *
 * 認証の流れ：
 *
 * 1. GET /sanctum/csrf-cookie
 * 2. POST /login
 * 3. Laravel Session Cookie取得
 * 4. /dashboardへ移動
 *
 * CSRF Cookie取得処理は
 * login()内部で行う。
 */
export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    remember,
    setRemember,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /**
   * Login Form送信処理。
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    /**
     * 二重送信を防止する。
     */
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      /**
       * login()内部では、
       *
       * GET /sanctum/csrf-cookie
       * ↓
       * POST /login
       *
       * の順でLaravelへRequestする。
       */
      await login({
        email:
          email.trim(),

        password,

        remember,
      });

      /**
       * Login成功後はDashboardへ移動する。
       *
       * replace()を使うことで、
       * Browser BackでLogin画面へ
       * 戻りにくくする。
       */
      router.replace(
        "/dashboard",
      );

      /**
       * Server Componentを再取得し、
       * 新しく作成されたLaravel Session Cookieを
       * (app)/layout.tsxへ反映させる。
       */
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        /**
         * LaravelのAuthentication失敗時。
         *
         * Backend側のValidation Messageを
         * そのまま詳細表示するのではなく、
         * Login画面では統一したMessageを表示する。
         */
        if (
          error.status === 422 ||
          error.status === 401
        ) {
          setErrorMessage(
            "メールアドレスまたはパスワードが正しくありません。",
          );

          return;
        }

        /**
         * CSRF Token期限切れ等。
         */
        if (error.status === 419) {
          setErrorMessage(
            "認証情報の有効期限が切れました。もう一度ログインしてください。",
          );

          return;
        }

        setErrorMessage(
          "ログイン処理に失敗しました。時間をおいて再度お試しください。",
        );

        return;
      }

      /**
       * Laravel Server停止やNetwork Errorなど、
       * HTTP Responseそのものを受け取れなかった場合。
       */
      setErrorMessage(
        "サーバーへ接続できませんでした。接続状態を確認してください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Service名 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-sm">
            SF
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            SalesFlow AI
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            営業活動をスマートに管理
          </p>
        </div>

        {/* Login Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              ログイン
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              登録されているアカウント情報を入力してください。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                メールアドレス
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="example@example.com"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                パスワード
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="パスワードを入力"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {/* Remember */}
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) =>
                  setRemember(
                    event.target.checked,
                  )
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />

              ログイン状態を保持する
            </label>

            {/* Error */}
            {errorMessage !== "" && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting
                ? "ログイン中..."
                : "ログイン"}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          SalesFlow AI
        </p>
      </div>
    </main>
  );
}