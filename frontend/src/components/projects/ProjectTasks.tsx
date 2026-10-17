import Link from "next/link";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

/**
 * ProjectTasksへ渡すProps。
 *
 * Laravel Task APIから取得した、
 * 対象Projectに所属するTaskを表示する。
 */
type ProjectTasksProps = {
  tasks: Task[];
};

/**
 * Task Statusの日本語表示。
 *
 * Backend側Task Domainで定義している
 * 4種類のStatusすべてに対応する。
 */
const statusLabels: Record<
  TaskStatus,
  string
> = {
  todo: "未着手",
  in_progress: "対応中",
  completed: "完了",
  cancelled: "中止",
};

/**
 * Task Statusごとの表示Class。
 */
const statusClasses: Record<
  TaskStatus,
  string
> = {
  todo:
    "bg-slate-100 text-slate-600",

  in_progress:
    "bg-blue-50 text-blue-600",

  completed:
    "bg-emerald-50 text-emerald-600",

  cancelled:
    "bg-red-50 text-red-600",
};

/**
 * Task Priorityの日本語表示。
 */
const priorityLabels: Record<
  TaskPriority,
  string
> = {
  high: "高",
  medium: "中",
  low: "低",
};

/**
 * Task Priorityごとの表示Class。
 */
const priorityClasses: Record<
  TaskPriority,
  string
> = {
  high:
    "bg-red-50 text-red-600",

  medium:
    "bg-orange-50 text-orange-600",

  low:
    "bg-emerald-50 text-emerald-600",
};

/**
 * Project詳細画面に表示する関連Task一覧。
 *
 * Project詳細Page側で、
 *
 * GET /api/v1/tasks?projectId={projectId}
 *
 * を実行し、
 * 対象Projectに所属するTaskだけを取得する。
 *
 * 旧Mock用ProjectTaskではなく、
 * Task Domainで定義した正式なTask型を使用する。
 */
export default function ProjectTasks({
  tasks,
}: ProjectTasksProps) {
  return (
    <section
      id="tasks"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* ================================================
       * Header
       * ================================================ */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          関連タスク
        </h2>

        <span className="text-sm text-slate-400">
          {tasks.length}件
        </span>
      </div>

      {/* ================================================
       * Task List
       * ================================================ */}
      <div className="mt-5 divide-y divide-slate-100">
        {tasks.map(
          (task) => (
            <div
              key={task.id}
              className="py-4 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Task基本情報 */}
                <div className="min-w-0">
                  {/*
                   * Task詳細Pageは現時点では
                   * 作成していないため、
                   * Task編集Pageへ移動する。
                   */}
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="font-semibold text-slate-800 transition hover:text-blue-600"
                  >
                    {task.title}
                  </Link>

                  {/* 期限 */}
                  <p className="mt-1 text-sm text-slate-400">
                    期限：
                    {
                      task.dueDate ??
                      "未設定"
                    }
                  </p>

                  {/* Task詳細 */}
                  {task.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        task.description
                      }
                    </p>
                  )}
                </div>

                {/* Status / Priority */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  {/* 優先度 */}
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      priorityClasses[
                        task.priority
                      ],
                    ].join(" ")}
                  >
                    優先度：
                    {
                      priorityLabels[
                        task.priority
                      ]
                    }
                  </span>

                  {/* Status */}
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusClasses[
                        task.status
                      ],
                    ].join(" ")}
                  >
                    {
                      statusLabels[
                        task.status
                      ]
                    }
                  </span>
                </div>
              </div>
            </div>
          ),
        )}

        {/* Taskが存在しない場合 */}
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            関連タスクはありません。
          </p>
        )}
      </div>
    </section>
  );
}