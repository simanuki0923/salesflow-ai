import type {
  ProjectPriority,
  ProjectTask,
  ProjectTaskStatus,
} from "@/types/project";

/**
 * ProjectTasksへ渡すProps。
 */
type ProjectTasksProps = {
  tasks: ProjectTask[];
};

/**
 * タスク状態の日本語表示。
 */
const statusLabels: Record<
  ProjectTaskStatus,
  string
> = {
  todo: "未着手",
  in_progress: "対応中",
  completed: "完了",
};

/**
 * タスク状態ごとの色。
 */
const statusClasses: Record<
  ProjectTaskStatus,
  string
> = {
  todo:
    "bg-slate-100 text-slate-600",

  in_progress:
    "bg-blue-50 text-blue-600",

  completed:
    "bg-emerald-50 text-emerald-600",
};

/**
 * 優先度の日本語表示。
 */
const priorityLabels: Record<
  ProjectPriority,
  string
> = {
  high: "高",
  medium: "中",
  low: "低",
};

/**
 * 優先度ごとの色。
 */
const priorityClasses: Record<
  ProjectPriority,
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
 * 案件に紐づくタスク一覧。
 *
 * 現在は閲覧のみ。
 *
 * タスク管理機能実装後は、
 * 完了操作や詳細画面へのリンクなどを追加する予定。
 */
export default function ProjectTasks({
  tasks,
}: ProjectTasksProps) {
  return (
    <section
      id="tasks"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-slate-900">
          関連タスク
        </h2>

        <span className="text-sm text-slate-400">
          {tasks.length}件
        </span>

      </div>


      <div className="mt-5 divide-y divide-slate-100">

        {tasks.map((task) => (
          <div
            key={task.id}
            className="py-4 first:pt-0 last:pb-0"
          >

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <p className="font-semibold text-slate-800">
                  {task.title}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  担当：{task.assignee}
                  {" / "}
                  期限：{task.dueDate}
                </p>

              </div>


              <div className="flex shrink-0 gap-2">

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


                {/* Task Status */}
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
        ))}


        {/* Taskがない場合 */}
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            関連タスクはありません。
          </p>
        )}

      </div>
    </section>
  );
}