import Link from "next/link";

import type {
  CustomerProject,
  CustomerProjectStatus,
} from "@/types/customer";

/**
 * 関連案件一覧へ渡すProps。
 */
type CustomerProjectsProps = {
  projects: CustomerProject[];
};

/**
 * 案件ステータスを日本語表示へ変換する。
 */
function getStatusLabel(
  status: CustomerProjectStatus,
): string {
  switch (status) {
    case "proposal":
      return "提案中";

    case "in_progress":
      return "進行中";

    case "completed":
      return "完了";
  }
}

/**
 * 案件ステータスごとの表示色を返す。
 */
function getStatusClass(
  status: CustomerProjectStatus,
): string {
  switch (status) {
    case "proposal":
      return "bg-amber-50 text-amber-600";

    case "in_progress":
      return "bg-blue-50 text-blue-600";

    case "completed":
      return "bg-emerald-50 text-emerald-600";
  }
}

/**
 * 金額を日本円形式へ変換する。
 *
 * 例：
 *
 * 550000
 *
 * ↓
 *
 * ¥550,000
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 顧客に紐づく案件一覧。
 */
export default function CustomerProjects({
  projects,
}: CustomerProjectsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          関連案件
        </h2>

        <Link
          href="/projects"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          すべて見る
        </Link>
      </div>

      <div className="mt-5 divide-y divide-slate-100">

        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block py-4 transition first:pt-0 last:pb-0 hover:bg-slate-50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-semibold text-slate-800">
                  {project.name}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  期限：{project.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  {formatCurrency(project.amount)}
                </span>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    getStatusClass(project.status),
                  ].join(" ")}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* 案件がない場合 */}
        {projects.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            関連案件はありません。
          </p>
        )}
      </div>
    </div>
  );
}