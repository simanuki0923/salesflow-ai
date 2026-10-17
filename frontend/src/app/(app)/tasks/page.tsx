import Link from "next/link";
import { Plus } from "lucide-react";

import TaskListClient
  from "@/components/tasks/TaskListClient";

import {
  getTasks,
  mapTask,
} from "@/lib/api/tasks";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

export const dynamic =
  "force-dynamic";

/**
 * Task一覧ページ。
 *
 * データの流れ：
 *
 * Browser
 * ↓
 * Next.js Server Component
 * ↓
 * Laravel Task API
 * ↓
 * PostgreSQL
 *
 * Laravel Session CookieをServer Componentから
 * APIへ転送することで、
 * Login User自身のTaskだけを取得する。
 */
export default async function TasksPage() {
  /**
   * Laravel Session Cookieを、
   * Server ComponentからLaravelへ転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Login Userが所有するTaskを取得する。
   *
   * Backendでは、
   *
   * Task
   * ↓
   * Project
   * ↓
   * Customer
   * ↓
   * User
   *
   * のRelationからUser Scopeを適用している。
   *
   * Client側で検索・Filter・Paginationを行うため、
   * 現段階では最大100件取得する。
   */
  const apiTasks =
    await getTasks(
      {
        perPage: 100,
      },
      authInit,
    );

  /**
   * Laravel API Dataを
   * Frontend UI用Task型へ変換する。
   */
  const tasks =
    apiTasks.map(
      mapTask,
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            タスク管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            案件に紐づくタスクの進捗・優先度・期限を管理します。
          </p>
        </div>

        {/*
         * 新規登録画面は次のCommitで実装する。
         *
         * Routeを先に用意しておくことで、
         * Task一覧UIと次のForm実装を自然につなげる。
         */}
        <Link
          href="/tasks/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          新規タスク登録
        </Link>
      </section>

      <TaskListClient
        tasks={tasks}
      />
    </div>
  );
}