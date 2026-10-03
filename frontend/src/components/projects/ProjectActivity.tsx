import {
  FileText,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type {
  ProjectActivity as ProjectActivityItem,
  ProjectActivityType,
} from "@/types/project";

/**
 * ProjectActivityへ渡すProps。
 */
type ProjectActivityProps = {
  activities: ProjectActivityItem[];
};

/**
 * 活動種類に応じたLucideアイコンを返す。
 */
function getActivityIcon(
  type: ProjectActivityType,
): LucideIcon {
  switch (type) {
    case "meeting":
      return MessageSquare;

    case "email":
      return Mail;

    case "call":
      return Phone;

    case "note":
      return FileText;
  }
}

/**
 * 案件に関係する活動履歴。
 *
 * ・商談
 * ・メール
 * ・電話
 * ・メモ
 *
 * を時系列で表示する。
 */
export default function ProjectActivity({
  activities,
}: ProjectActivityProps) {
  return (
    <section
      id="activity"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <h2 className="text-xl font-bold text-slate-900">
        活動履歴
      </h2>


      <div className="mt-6 space-y-6">

        {activities.map((activity) => {
          /**
           * 活動種類に対応する
           * Reactアイコンコンポーネントを取得する。
           */
          const Icon =
            getActivityIcon(activity.type);

          return (
            <div
              key={activity.id}
              className="flex gap-4"
            >

              {/* Activity Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon size={18} />
              </div>


              <div className="min-w-0 flex-1 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                  <p className="font-semibold text-slate-800">
                    {activity.title}
                  </p>

                  <span className="text-xs text-slate-400">
                    {activity.date}
                  </span>

                </div>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {activity.description}
                </p>

              </div>

            </div>
          );
        })}


        {/* 履歴0件 */}
        {activities.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            活動履歴はありません。
          </p>
        )}

      </div>
    </section>
  );
}