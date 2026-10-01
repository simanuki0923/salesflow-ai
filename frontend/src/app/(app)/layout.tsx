import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";

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
 * など、(app)配下のすべての画面へ
 * AppShellを適用する共通Layout。
 *
 * (app)はRoute Groupのため、
 * 実際のURLには「(app)」は含まれない。
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}