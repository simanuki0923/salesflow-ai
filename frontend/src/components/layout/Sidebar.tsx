"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  SquareCheckBig,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";

/**
 * Sidebarへ表示するメニュー情報。
 *
 * label:
 *   画面に表示する日本語名称
 *
 * href:
 *   遷移先URL
 *
 * icon:
 *   lucide-reactから取得したアイコンコンポーネント
 *
 * 同じJSXを何度も書かず、
 * 配列からメニューを生成できるようにしている。
 */
const menuItems = [
  {
    label: "ダッシュボード",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "顧客管理",
    href: "/customers",
    icon: Users,
  },
  {
    label: "案件管理",
    href: "/projects",
    icon: BriefcaseBusiness,
  },
  {
    label: "タスク管理",
    href: "/tasks",
    icon: SquareCheckBig,
  },
  {
    label: "商談メモ",
    href: "/meetings",
    icon: FileText,
  },
  {
    label: "AIアシスタント",
    href: "/ai",
    icon: Sparkles,
  },
  {
    label: "レポート",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "設定",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * アプリケーション左側のナビゲーション。
 *
 * usePathname()を使用するためClient Componentとして実装している。
 */
export default function Sidebar() {
  /**
   * 現在表示しているURLを取得する。
   *
   * 例:
   * /dashboard
   * /customers
   * /customers/1
   */
  const pathname = usePathname();

  /**
   * 現在のURLとメニューURLを比較し、
   * 選択中のメニューかどうかを判定する。
   */
  const isActive = (href: string) => {
    // Dashboardは完全一致した場合のみ選択状態にする
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    /*
     * /customers/1 のような詳細画面でも
     * 顧客管理メニューを選択状態にするためstartsWithを使用する。
     */
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col bg-[#102f52] text-white lg:flex">
      {/* SalesFlow AIロゴ */}
      <div className="flex h-[88px] items-center border-b border-white/10 px-7">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
            <Sparkles size={21} />
          </div>

          <div className="text-xl font-bold tracking-tight">
            <span>Sales</span>
            <span className="text-blue-400">Flow</span>
            <span> AI</span>
          </div>
        </Link>
      </div>

      {/* menuItems配列からSidebarメニューを生成 */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          /*
           * 配列に保存されているLucideアイコンを
           * Reactコンポーネントとして使用する。
           */
          const Icon = item.icon;

          // 現在表示中のメニューか判定
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-4 rounded-xl px-4 py-3",
                active
                  ? "bg-blue-500/30 text-white"
                  : "text-slate-200 hover:bg-white/10",
              ].join(" ")}
            >
              <Icon size={21} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}