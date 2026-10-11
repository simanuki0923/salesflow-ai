import type {
  ReactNode,
} from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

import type {
  AuthUser,
} from "@/lib/api/auth";

/**
 * AppShellへ渡すProps。
 *
 * children:
 * 各画面固有の内容。
 *
 * user:
 * Laravel /api/v1/meから取得した
 * Login User。
 */
type AppShellProps = {
  children: ReactNode;
  user: AuthUser;
};

/**
 * Login後画面の共通Layout。
 *
 * 左側:
 * Sidebar
 *
 * 上部:
 * Header
 *
 * 中央:
 * 各Page Component
 */
export default function AppShell({
  children,
  user,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* PC表示用Sidebar */}
      <Sidebar />

      {/*
       * Login User情報をHeaderへ渡す。
       */}
      <Header user={user} />

      {/*
       * lg以上ではSidebar幅260px分だけ
       * Main Contentを右へ移動する。
       */}
      <main className="min-h-screen pt-[88px] lg:ml-[260px]">
        <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}