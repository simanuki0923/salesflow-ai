import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Pencil,
} from "lucide-react";

import type {
  ProjectDetail,
  ProjectStatus,
} from "@/types/project";

/**
 * ProjectDetailHeaderへ渡すProps。
 */
type ProjectDetailHeaderProps = {
  project: ProjectDetail;
};

/**
 * 案件ステータスを日本語へ変換する。
 */
function getStatusLabel(
  status: ProjectStatus,
): string {
  switch (status) {
    case "draft":
      return "下書き";

    case "proposal":
      return "提案中";

    case "negotiation":
      return "商談中";

    case "in_progress":
      return "進行中";

    case "completed":
      return "完了";

    case "cancelled":
      return "中止";
  }
}

/**
 * 案件ステータスごとの表示色。
 *
 * Recordを使用して、
 * ProjectStatusの全種類に対する
 * classNameを定義する。
 */
const statusClasses: Record<
  ProjectStatus,
  string
> = {
  draft:
    "bg-slate-100 text-slate-600",

  proposal:
    "bg-amber-50 text-amber-600",

  negotiation:
    "bg-violet-50 text-violet-600",

  in_progress:
    "bg-blue-50 text-blue-600",

  completed:
    "bg-emerald-50 text-emerald-600",

  cancelled:
    "bg-rose-50 text-rose-600",
};

/**
 * 案件詳細画面上部。
 *
 * ・案件一覧へ戻る
 * ・案件名
 * ・顧客名
 * ・案件状態
 * ・編集画面へのリンク
 *
 * を表示する。
 */
export default function ProjectDetailHeader({
  project,
}: ProjectDetailHeaderProps) {
  return (
    <section className="space-y-5">

      {/* 案件一覧へ戻る */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />

        案件一覧へ戻る
      </Link>


      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* 案件情報 */}
        <div className="flex items-start gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <BriefcaseBusiness size={27} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {project.name}
              </h1>

              {/* 案件Status */}
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  statusClasses[project.status],
                ].join(" ")}
              >
                {getStatusLabel(
                  project.status,
                )}
              </span>

            </div>


            {/* 顧客詳細へのリンク */}
            <Link
              href={`/customers/${project.customerId}`}
              className="mt-2 inline-block text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              {project.customerName}
            </Link>

          </div>
        </div>


        {/* 案件編集 */}
        <Link
          href={`/projects/${project.id}/edit`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Pencil size={17} />

          案件情報を編集
        </Link>

      </div>
    </section>
  );
}