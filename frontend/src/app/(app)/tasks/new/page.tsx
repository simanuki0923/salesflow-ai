import TaskForm
  from "@/components/tasks/TaskForm";

import {
  getProjects,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  TaskProjectOption,
} from "@/types/task";

export const dynamic =
  "force-dynamic";

/**
 * Task新規登録ページ。
 *
 * Taskは必ずProjectへ所属するため、
 * Login Userが所有するProject一覧を
 * Laravel APIから取得する。
 */
export default async function TaskCreatePage() {
  /**
   * Server ComponentからLaravelへ
   * Session Cookieを転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Laravel側でUser Scopeされた
   * Project一覧だけ取得する。
   */
  const projects =
    await getProjects(
      {
        perPage: 100,
      },
      authInit,
    );

  /**
   * TaskFormのProject Select用Dataへ変換する。
   */
  const projectOptions:
    TaskProjectOption[] =
    projects.map(
      (project) => ({
        id:
          project.id,

        name:
          project.name,

        customerName:
          project.customerName,
      }),
    );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          新規タスク登録
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          案件に紐づく新しいタスクを登録します。
        </p>
      </section>

      <TaskForm
        mode="create"
        projectOptions={
          projectOptions
        }
      />
    </div>
  );
}