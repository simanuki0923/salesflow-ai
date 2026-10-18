import Link from "next/link";

import type {
  Meeting,
  MeetingMethod,
  MeetingStatus,
} from "@/types/meeting";

/**
 * ProjectMeetingsへ渡すProps。
 *
 * Laravel Meeting APIから取得した、
 * 対象Projectに所属するMeetingを表示する。
 */
type ProjectMeetingsProps = {
  meetings: Meeting[];
};

/**
 * Meeting Statusの日本語表示。
 */
const statusLabels: Record<
  MeetingStatus,
  string
> = {
  scheduled: "予定",
  completed: "完了",
  cancelled: "中止",
};

/**
 * Meeting Statusごとの表示Class。
 */
const statusClasses: Record<
  MeetingStatus,
  string
> = {
  scheduled:
    "bg-blue-50 text-blue-600",

  completed:
    "bg-emerald-50 text-emerald-600",

  cancelled:
    "bg-red-50 text-red-600",
};

/**
 * Meeting Methodの日本語表示。
 */
const methodLabels: Record<
  MeetingMethod,
  string
> = {
  in_person: "対面",
  online: "オンライン",
  phone: "電話",
};

/**
 * Meeting Methodごとの表示Class。
 */
const methodClasses: Record<
  MeetingMethod,
  string
> = {
  in_person:
    "bg-violet-50 text-violet-600",

  online:
    "bg-sky-50 text-sky-600",

  phone:
    "bg-amber-50 text-amber-700",
};

/**
 * Laravel MeetingResourceの日時を
 * Project詳細表示用へ変換する。
 *
 * Date ObjectによるTime Zone変換は行わず、
 * Meeting画面と同じWall Clock時刻を表示する。
 *
 * 例：
 *
 * 2026-11-10T14:00:00.000000Z
 *
 * ↓
 *
 * 2026/11/10 14:00
 */
function formatScheduledAt(
  value: string,
): string {
  const normalized =
    value.replace(
      " ",
      "T",
    );

  const [
    datePart,
    timePart,
  ] = normalized.split("T");

  if (
    !datePart ||
    !timePart
  ) {
    return value;
  }

  return `${
    datePart.replaceAll(
      "-",
      "/",
    )
  } ${timePart.slice(
    0,
    5,
  )}`;
}

/**
 * Project詳細画面に表示する関連Meeting一覧。
 *
 * Project詳細Page側で、
 *
 * GET /api/v1/meetings?projectId={projectId}
 *
 * を実行し、
 * 対象Projectに所属するMeetingだけを取得する。
 */
export default function ProjectMeetings({
  meetings,
}: ProjectMeetingsProps) {
  return (
    <section
      id="meetings"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* ================================================
       * Header
       * ================================================ */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          関連商談
        </h2>

        <span className="text-sm text-slate-400">
          {meetings.length}件
        </span>
      </div>

      {/* ================================================
       * Meeting List
       * ================================================ */}
      <div className="mt-5 divide-y divide-slate-100">
        {meetings.map(
          (meeting) => (
            <div
              key={
                meeting.id
              }
              className="py-4 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Meeting基本情報 */}
                <div className="min-w-0">
                  {/*
                   * Meeting詳細Pageは現段階ではないため、
                   * 編集Pageへ移動する。
                   */}
                  <Link
                    href={`/meetings/${meeting.id}/edit`}
                    className="font-semibold text-slate-800 transition hover:text-blue-600"
                  >
                    {
                      meeting.title
                    }
                  </Link>

                  {/* 商談日時 */}
                  <p className="mt-1 text-sm text-slate-400">
                    日時：
                    {
                      formatScheduledAt(
                        meeting.scheduledAt,
                      )
                    }

                    {meeting.durationMinutes !==
                      null && (
                      <>
                        {" / "}
                        {
                          meeting.durationMinutes
                        }
                        分
                      </>
                    )}
                  </p>

                  {/* Location */}
                  {meeting.location && (
                    <p className="mt-1 text-sm text-slate-400">
                      場所：
                      {
                        meeting.location
                      }
                    </p>
                  )}

                  {/* Meeting詳細 */}
                  {meeting.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        meeting.description
                      }
                    </p>
                  )}

                  {/* 商談結果 */}
                  {meeting.result && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">
                        商談結果
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {
                          meeting.result
                        }
                      </p>
                    </div>
                  )}

                  {/* Next Action */}
                  {meeting.nextAction && (
                    <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2">
                      <p className="text-xs font-semibold text-blue-600">
                        次回対応
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        {
                          meeting.nextAction
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Status / Method */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      methodClasses[
                        meeting.method
                      ],
                    ].join(" ")}
                  >
                    {
                      methodLabels[
                        meeting.method
                      ]
                    }
                  </span>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusClasses[
                        meeting.status
                      ],
                    ].join(" ")}
                  >
                    {
                      statusLabels[
                        meeting.status
                      ]
                    }
                  </span>
                </div>
              </div>
            </div>
          ),
        )}

        {/* Meetingが存在しない場合 */}
        {meetings.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            関連商談はありません。
          </p>
        )}
      </div>
    </section>
  );
}
