import { notFound } from "next/navigation";

import TaskForm
  from "@/components/tasks/TaskForm";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getProjects,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import {
  getTask,
} from "@/lib/api/tasks";

import type {
  TaskFormData,
  TaskProjectOption,
} from "@/types/task";

export const dynamic =
  "force-dynamic";

type TaskEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Task編集ページ。
 */
export default async function TaskEditPage({
  params,
}: TaskEditPageProps) {
  const { id } =
    await params;

  const taskId =
    Number(id);

  /**
   * 不正なURL Parameterは404。
   */
  if (
    !Number.isInteger(
      taskId,
    ) ||
    taskId <= 0
  ) {
    notFound();
  }

  /**
   * Task API / Project APIの両方へ
   * Laravel Session Cookieを転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  let task;
  let projects;

  try {
    /**
     * TaskとProject一覧は相互依存しないため
     * 並列取得する。
     */
    [
      task,
      projects,
    ] = await Promise.all([
      getTask(
        taskId,
        authInit,
      ),

      getProjects(
        {
          perPage: 100,
        },
        authInit,
      ),
    ]);
  } catch (error) {
    /**
     * Taskが存在しない、
     * または他User所有Taskの場合、
     * Laravelは404を返す。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  /**
   * TaskFormのProject Select用Data。
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

  /**
   * Laravel Task API Dataを
   * HTML Form用の値へ変換する。
   *
   * projectId:
   * number → string
   *
   * description / dueDate:
   * null → ""
   */
  const initialData:
    TaskFormData = {
    projectId:
      String(
        task.projectId,
      ),

    title:
      task.title,

    description:
      task.description ?? "",

    status:
      task.status,

    priority:
      task.priority,

    dueDate:
      task.dueDate ?? "",
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          タスク情報を編集
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          登録されているタスク情報を変更します。
        </p>
      </section>

      <TaskForm
        mode="edit"
        taskId={taskId}
        projectOptions={
          projectOptions
        }
        initialData={
          initialData
        }
      />
    </div>
  );
}