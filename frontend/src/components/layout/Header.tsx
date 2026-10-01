import { Bell, ChevronDown, Search } from "lucide-react";

/**
 * ログイン後画面の共通ヘッダー。
 *
 * 現段階では検索欄・通知・ユーザー情報は
 * UI確認用の仮実装。
 *
 * Laravel API接続後はログインユーザー情報を
 * APIから取得して表示する予定。
 */
export default function Header() {
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
              className="h-12 w-full rounded-xl border border-slate-200 pl-12 pr-4"
            />
          </div>
        </div>

        {/* ヘッダー右側 */}
        <div className="ml-auto flex items-center gap-4">

          {/* 通知ボタン：後でLaravel APIと接続予定 */}
          <button type="button" aria-label="通知">
            <Bell size={21} />
          </button>

          {/*
            現在は画面デザイン確認用の仮ユーザー。
            認証実装後にLaravelから取得したユーザー情報へ変更する。
          */}
          <button type="button" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              山
            </div>

            <div>
              <p>山田 太郎</p>
              <p>管理者</p>
            </div>

            <ChevronDown size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}