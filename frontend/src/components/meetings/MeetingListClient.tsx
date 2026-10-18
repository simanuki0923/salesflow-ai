"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";

import type {
  Meeting,
  MeetingMethod,
  MeetingStatus,
} from "@/types/meeting";

/**
 * MeetingListClientへ渡すProps。
 *
 * meetingsはServer Componentから
 * Laravel Meeting APIの取得結果を渡す。
 */
type MeetingListClientProps = {
  meetings: Meeting[];
};

/**
 * Status Filter。
 */
type StatusFilter =
  | "all"
  | MeetingStatus;

/**
 * Method Filter。
 */
type MethodFilter =
  | "all"
  | MeetingMethod;

/**
 * Client側Paginationで
 * 1ページに表示する件数。
 *
 * Task / Project一覧と同じ5件に統一する。
 */
const ITEMS_PER_PAGE = 5;

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
 * Laravelから返されるISO 8601日時を
 * 一覧表示用へ変換する。
 *
 * 例：
 *
 * 2026-11-10T14:00:00.000000Z
 *
 * ↓
 *
 * 2026/11/10 14:00
 *
 * Meetingでは現段階で入力したWall Clock時刻を
 * そのまま表示する方針とし、
 * Browser Time Zoneによる自動変換は行わない。
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
 * Meeting一覧の検索・Filter・Paginationを
 * 担当するClient Component。
 *
 * Server Component：
 *   Laravel APIからMeetingを取得
 *
 * Client Component：
 *   Keyword検索
 *   Status Filter
 *   Method Filter
 *   Pagination
 */
export default function MeetingListClient({
  meetings,
}: MeetingListClientProps) {
  /**
   * Keyword検索。
   */
  const [
    searchKeyword,
    setSearchKeyword,
  ] = useState("");

  /**
   * Status Filter。
   */
  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all",
    );

  /**
   * Method Filter。
   */
  const [
    methodFilter,
    setMethodFilter,
  ] =
    useState<MethodFilter>(
      "all",
    );

  /**
   * 現在表示中Page。
   */
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /**
   * Meetingを検索・Filter条件で
   * 絞り込む。
   */
  const filteredMeetings =
    useMemo(
      () => {
        const keyword =
          searchKeyword
            .trim()
            .toLowerCase();

        return meetings.filter(
          (meeting) => {
            /**
             * Backend Meeting APIと合わせて、
             *
             * ・商談名
             * ・商談内容
             * ・案件名
             * ・顧客名
             * ・場所
             * ・商談結果
             * ・次回対応
             *
             * を検索対象とする。
             */
            const searchableValues = [
              meeting.title,
              meeting.projectName,
              meeting.customerName,
              meeting.description ?? "",
              meeting.location ?? "",
              meeting.result ?? "",
              meeting.nextAction ?? "",
            ];

            const matchesKeyword =
              keyword === "" ||
              searchableValues.some(
                (value) =>
                  value
                    .toLowerCase()
                    .includes(
                      keyword,
                    ),
              );

            const matchesStatus =
              statusFilter ===
                "all" ||
              meeting.status ===
                statusFilter;

            const matchesMethod =
              methodFilter ===
                "all" ||
              meeting.method ===
                methodFilter;

            return (
              matchesKeyword &&
              matchesStatus &&
              matchesMethod
            );
          },
        );
      },
      [
        meetings,
        searchKeyword,
        statusFilter,
        methodFilter,
      ],
    );

  /**
   * 全Meeting件数。
   */
  const totalCount =
    meetings.length;

  /**
   * 予定Meeting件数。
   */
  const scheduledCount =
    meetings.filter(
      (meeting) =>
        meeting.status ===
        "scheduled",
    ).length;

  /**
   * 完了Meeting件数。
   */
  const completedCount =
    meetings.filter(
      (meeting) =>
        meeting.status ===
        "completed",
    ).length;

  /**
   * 総Page数。
   *
   * 0件でも1Pageとして表示する。
   */
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredMeetings.length /
          ITEMS_PER_PAGE,
      ),
    );

  /**
   * 現在Pageの開始位置。
   */
  const startIndex =
    (
      currentPage - 1
    ) * ITEMS_PER_PAGE;

  /**
   * 現在Pageへ表示するMeeting。
   */
  const visibleMeetings =
    filteredMeetings.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE,
    );

  /**
   * Pagination表示用件数。
   */
  const displayedFrom =
    filteredMeetings.length === 0
      ? 0
      : startIndex + 1;

  const displayedTo =
    Math.min(
      startIndex +
        ITEMS_PER_PAGE,
      filteredMeetings.length,
    );

  /**
   * Keyword変更。
   */
  const handleSearchChange = (
    event:
      ChangeEvent<HTMLInputElement>,
  ): void => {
    setSearchKeyword(
      event.target.value,
    );

    setCurrentPage(1);
  };

  /**
   * Status変更。
   */
  const handleStatusChange = (
    event:
      ChangeEvent<HTMLSelectElement>,
  ): void => {
    setStatusFilter(
      event.target
        .value as StatusFilter,
    );

    setCurrentPage(1);
  };

  /**
   * Method変更。
   */
  const handleMethodChange = (
    event:
      ChangeEvent<HTMLSelectElement>,
  ): void => {
    setMethodFilter(
      event.target
        .value as MethodFilter,
    );

    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* =====================================================
       * Meeting集計
       * ===================================================== */}
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="全商談"
          value={`${totalCount}件`}
        />

        <SummaryCard
          label="予定"
          value={`${scheduledCount}件`}
        />

        <SummaryCard
          label="完了"
          value={`${completedCount}件`}
        />
      </section>

      {/* =====================================================
       * 検索・Filter
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          {/* Keyword */}
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={
                searchKeyword
              }
              onChange={
                handleSearchChange
              }
              placeholder="商談名・案件名・顧客名・内容で検索"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <select
            value={
              statusFilter
            }
            onChange={
              handleStatusChange
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              すべてのステータス
            </option>

            <option value="scheduled">
              予定
            </option>

            <option value="completed">
              完了
            </option>

            <option value="cancelled">
              中止
            </option>
          </select>

          {/* Method */}
          <select
            value={
              methodFilter
            }
            onChange={
              handleMethodChange
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              すべての商談方法
            </option>

            <option value="in_person">
              対面
            </option>

            <option value="online">
              オンライン
            </option>

            <option value="phone">
              電話
            </option>
          </select>
        </div>
      </section>

      {/* =====================================================
       * Meeting一覧
       * ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {filteredMeetings.length}
            件の商談
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">
                  商談
                </th>

                <th className="px-6 py-4">
                  案件
                </th>

                <th className="px-6 py-4">
                  顧客
                </th>

                <th className="px-6 py-4">
                  商談日時
                </th>

                <th className="px-6 py-4">
                  方法
                </th>

                <th className="px-6 py-4">
                  ステータス
                </th>

                <th className="px-6 py-4">
                  場所
                </th>

                <th className="px-6 py-4 text-right">
                  操作
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleMeetings.map(
                (meeting) => (
                  <tr
                    key={
                      meeting.id
                    }
                    className="transition hover:bg-slate-50"
                  >
                    {/* Meeting */}
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-800">
                        {
                          meeting.title
                        }
                      </p>

                      {meeting.description && (
                        <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                          {
                            meeting.description
                          }
                        </p>
                      )}
                    </td>

                    {/* Project */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/projects/${meeting.projectId}`}
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        {
                          meeting.projectName
                        }
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {
                        meeting.customerName
                      }
                    </td>

                    {/* Scheduled At */}
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-700">
                        {
                          formatScheduledAt(
                            meeting.scheduledAt,
                          )
                        }
                      </p>

                      {meeting.durationMinutes !==
                        null && (
                        <p className="mt-1 text-xs text-slate-400">
                          {
                            meeting.durationMinutes
                          }
                          分
                        </p>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-6 py-5">
                      <MethodBadge
                        method={
                          meeting.method
                        }
                      />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <StatusBadge
                        status={
                          meeting.status
                        }
                      />
                    </td>

                    {/* Location */}
                    <td className="px-6 py-5">
                      <p className="max-w-[220px] truncate text-sm text-slate-500">
                        {
                          meeting.location ??
                          "未設定"
                        }
                      </p>
                    </td>

                    {/* Operation */}
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/meetings/${meeting.id}/edit`}
                        className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ),
              )}

              {visibleMeetings.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    条件に一致する商談はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
         * Pagination
         * =================================================== */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {displayedFrom}
            〜
            {displayedTo}
            件 /
            {" "}
            {filteredMeetings.length}
            件
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                currentPage <= 1
              }
              onClick={() =>
                setCurrentPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              前へ
            </button>

            <span className="px-2 text-sm text-slate-500">
              {currentPage}
              {" / "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                currentPage >=
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (current) =>
                    Math.min(
                      totalPages,
                      current + 1,
                    ),
                )
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              次へ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * 一覧上部の集計Card。
 */
function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/**
 * Meeting Status Badge。
 */
function StatusBadge({
  status,
}: {
  status: MeetingStatus;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        statusClasses[
          status
        ],
      ].join(" ")}
    >
      {
        statusLabels[
          status
        ]
      }
    </span>
  );
}

/**
 * Meeting Method Badge。
 */
function MethodBadge({
  method,
}: {
  method: MeetingMethod;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        methodClasses[
          method
        ],
      ].join(" ")}
    >
      {
        methodLabels[
          method
        ]
      }
    </span>
  );
}
