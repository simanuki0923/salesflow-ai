"use client";

import {
  useDemoMode,
} from "./DemoModeProvider";

/**
 * 公開Demo Account利用中であることを
 * Login後の全画面で案内するBanner。
 *
 * Demo User以外では何も表示しない。
 */
export default function DemoModeBanner() {
  const {
    isDemo,
    isReadOnly,
  } = useDemoMode();

  if (!isDemo) {
    return null;
  }

  return (
    <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold tracking-wide text-white">
              DEMO MODE
            </span>

            {isReadOnly && (
              <span className="text-xs font-semibold text-blue-700">
                READ ONLY
              </span>
            )}
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-800">
            SalesFlow AIの公開Demo環境です。
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            データの閲覧やMeeting AI提案をお試しいただけます。
            {isReadOnly &&
              " 登録・変更・削除はDemo Data保護のため無効です。"}
          </p>
        </div>
      </div>
    </section>
  );
}
