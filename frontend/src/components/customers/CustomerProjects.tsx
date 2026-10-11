import Link from "next/link";

import type {
  CustomerProject,
  CustomerProjectStatus,
} from "@/types/customer";

/**
 * CustomerProjectsのProps。
 */
type CustomerProjectsProps = {
  projects: CustomerProject[];
};

/**
 * Project Statusを日本語表示へ変換する。
 */
const statusLabels: Record<
  CustomerProjectStatus,
  string
> = {
  draft: "下書き",
  proposal: "提案中",
  negotiation: "商談中",
  in_progress: "進行中",
  completed: "完了",
  cancelled: "中止",
};

/**
 * Project StatusごとのBadgeデザイン。
 *
 * Status追加時にTypeScriptが不足を検知できるよう、
 * Record<CustomerProjectStatus, string>
 * としている。
 */
const statusClasses: Record<
  CustomerProjectStatus,
  string
> = {
  draft:
    "bg-slate-100 text-slate-600",

  proposal:
    "bg-amber-50 text-amber-700",

  negotiation:
    "bg-violet-50 text-violet-700",

  in_progress:
    "bg-blue-50 text-blue-700",

  completed:
    "bg-emerald-50 text-emerald-700",

  cancelled:
    "bg-rose-50 text-rose-700",
};

/**
 * 金額表示用Helper。
 */
function formatCurrency(
  amount: number,
): string {
  return new Intl.NumberFormat(
    "ja-JP",
    {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

/**
 * Customerに紐づくProject一覧。
 */
export default function CustomerProjects({
  projects,
}: CustomerProjectsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            案件
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            この顧客に紐づく案件一覧です。
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        /**
         * Project APIから0件だった場合。
         */
        <div className="rounded-xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
          登録されている案件はありません。
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(
            (project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {project.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[project.status]}`}
                      >
                        {
                          statusLabels[
                            project.status
                          ]
                        }
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      期限：
                      {project.dueDate}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {formatCurrency(
                      project.amount,
                    )}
                  </p>
                </div>
              </Link>
            ),
          )}
        </div>
      )}
    </section>
  );
}