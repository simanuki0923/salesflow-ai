import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * AppShellコンポーネントへ渡すPropsの型定義。
 *
 * children:
 * Dashboard、顧客管理、案件管理など、
 * 各ページ固有の画面内容がここへ渡される。
 */
type AppShellProps = {
  children: ReactNode;
};

/**
 * ログイン後画面の共通レイアウト。
 *
 * 左側にSidebar、
 * 上部にHeader、
 * 中央部分に各ページの内容を表示する。
 *
 * このコンポーネントを共通化することで、
 * Dashboard・顧客管理・案件管理ごとに
 * SidebarやHeaderを重複して記述する必要がなくなる。
 */
export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* PC表示用の左サイドメニュー */}
      <Sidebar />

      {/* ログインユーザー情報や検索欄を表示する共通ヘッダー */}
      <Header />

      {/*
        lgサイズ以上ではSidebarの横幅260px分だけ
        メインコンテンツを右へずらす。
      */}
      <main className="min-h-screen pt-[88px] lg:ml-[260px]">
        {/*
          画面が大きくなりすぎてもコンテンツが広がりすぎないよう
          最大幅を1600pxに制限する。
        */}
        <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-8">
          {/* 各ページ固有のコンテンツを表示 */}
          {children}
        </div>
      </main>
    </div>
  );
}