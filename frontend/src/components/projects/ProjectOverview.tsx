import {
  CalendarDays,
  CircleDollarSign,
  Layers3,
  User,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { ProjectDetail } from "@/types/project";

/**
 * ProjectOverviewへ渡すProps。
 */
type ProjectOverviewProps = {
  project: ProjectDetail;
};

/**
 * 案件金額を日本円表示へ変換する。
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
 * 案件の基本情報・概要・進捗・スケジュールを表示する。
 */
export default function ProjectOverview({
  project,
}: ProjectOverviewProps) {
  /**
   * 万が一progressが0未満や100超になっても
   * Progress Barが崩れないよう0〜100に制限する。
   */
  const safeProgress = Math.min(
    100,
    Math.max(0, project.progress),
  );

  return (
    <div
      id="overview"
      className="space-y-6"
    >

      {/* =====================================================
       * 案件基本情報
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          案件情報
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <InfoItem
            icon={Layers3}
            label="案件種別"
            value={project.type}
          />

          <InfoItem
            icon={User}
            label="担当者"
            value={project.ownerName}
          />

          <InfoItem
            icon={CircleDollarSign}
            label="案件金額"
            value={formatCurrency(
              project.amount,
            )}
          />

          <InfoItem
            icon={CalendarDays}
            label="案件期間"
            value={`${project.startDate} ～ ${project.dueDate}`}
          />

        </div>


        {/* 案件概要 */}
        <div className="mt-7 border-t border-slate-100 pt-6">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            案件概要
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {project.description}
          </p>

        </div>
      </section>


      {/* =====================================================
       * 進捗
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-bold text-slate-900">
            進捗状況
          </h2>

          <span className="text-2xl font-bold text-blue-600">
            {safeProgress}%
          </span>

        </div>


        {/* Progress Bar */}
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${safeProgress}%`,
            }}
          />

        </div>


        {/* スケジュール */}
        <div className="mt-8">

          <h3 className="text-sm font-bold text-slate-800">
            スケジュール
          </h3>

          <div className="mt-5 space-y-4">

            {project.milestones.map(
              (milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-4"
                >

                  {/* 完了状態 */}
                  <span
                    className={[
                      "h-3 w-3 shrink-0 rounded-full",

                      milestone.status ===
                      "completed"
                        ? "bg-emerald-500"
                        : "bg-slate-300",
                    ].join(" ")}
                  />

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4">

                    <span className="text-sm font-medium text-slate-700">
                      {milestone.title}
                    </span>

                    <span className="shrink-0 text-xs text-slate-400">
                      {milestone.date}
                    </span>

                  </div>
                </div>
              ),
            )}

          </div>
        </div>
      </section>

    </div>
  );
}


/**
 * 案件基本情報で共通利用する1項目。
 */
type InfoItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

/**
 * 案件種別・担当者・金額など、
 * 同じ表示形式を共通化する。
 */
function InfoItem({
  icon: Icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={19} />
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>
    </div>
  );
}