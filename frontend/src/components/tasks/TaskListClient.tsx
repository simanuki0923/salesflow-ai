"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

/**
 * TaskListClientへ渡すProps。
 *
 * tasksはServer Componentのpage.tsxで
 * Laravel APIから取得したTask一覧。
 */
type TaskListClientProps = {
  tasks: Task[];
};

/**
 * Status Filter。
 */
type StatusFilter =
  | "all"
  | TaskStatus;

/**
 * Priority Filter。
 */
type PriorityFilter =
  | "all"
  | TaskPriority;

/**
 * Client側Paginationで
 * 1ページに表示する件数。
 *
 * Project一覧と同じ5件に統一する。
 */
const ITEMS_PER_PAGE = 5;

/**
 * Task Statusの日本語表示。
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
 * Task一覧の検索・Filter・Paginationを
 * 担当するClient Component。
 *
 * Server Component：
 *   Laravel APIからTaskを取得
 *
 * Client Component：
 *   検索
 *   Status Filter
 *   Priority Filter
 *   Pagination
 *
 * と責務を分ける。
 */
export default function TaskListClient({
  tasks,
}: TaskListClientProps) {
  /**
   * 検索文字列。
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
   * Priority Filter。
   */
  const [
    priorityFilter,
    setPriorityFilter,
  ] =
    useState<PriorityFilter>(
      "all",
    );

  /**
   * 現在表示中のページ。
   */
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /**
   * 検索・Status・Priority条件を使って
   * 表示対象Taskを絞り込む。
   *
   * Laravel側にも同じFilter APIがあるが、
   * 現在は最大100件を取得して
   * Client側で即時FilterするUIとする。
   */
  const filteredTasks =
    useMemo(
      () => {
        const keyword =
          searchKeyword
            .trim()
            .toLowerCase();

        return tasks.filter(
          (task) => {
            /**
             * Task名・Task詳細・案件名・顧客名を
             * 検索対象にする。
             */
            const matchesKeyword =
              keyword === "" ||
              task.title
                .toLowerCase()
                .includes(
                  keyword,
                ) ||
              task.projectName
                .toLowerCase()
                .includes(
                  keyword,
                ) ||
              task.customerName
                .toLowerCase()
                .includes(
                  keyword,
                ) ||
              (
                task.description
                  ?.toLowerCase()
                  .includes(
                    keyword,
                  )
                ?? false
              );

            const matchesStatus =
              statusFilter ===
                "all" ||
              task.status ===
                statusFilter;

            const matchesPriority =
              priorityFilter ===
                "all" ||
              task.priority ===
                priorityFilter;

            return (
              matchesKeyword &&
              matchesStatus &&
              matchesPriority
            );
          },
        );
      },
      [
        tasks,
        searchKeyword,
        statusFilter,
        priorityFilter,
      ],
    );

  /**
   * 全Task件数。
   */
  const totalCount =
    tasks.length;

  /**
   * 対応中Task件数。
   */
  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status ===
        "in_progress",
    ).length;

  /**
   * 完了Task件数。
   */
  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "completed",
    ).length;

  /**
   * 総ページ数。
   *
   * 0件の場合でも1ページとして扱う。
   */
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredTasks.length /
          ITEMS_PER_PAGE,
      ),
    );

  /**
   * 現在ページの開始位置。
   */
  const startIndex =
    (
      currentPage - 1
    ) * ITEMS_PER_PAGE;

  /**
   * 現在ページに表示するTask。
   */
  const visibleTasks =
    filteredTasks.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE,
    );

  /**
   * Pagination表示用開始件数。
   */
  const displayedFrom =
    filteredTasks.length === 0
      ? 0
      : startIndex + 1;

  /**
   * Pagination表示用終了件数。
   */
  const displayedTo =
    Math.min(
      startIndex +
        ITEMS_PER_PAGE,
      filteredTasks.length,
    );

  /**
   * 検索文字列変更。
   *
   * 条件変更後に現在ページが存在しない状態を
   * 避けるため1ページ目へ戻す。
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
   * Status Filter変更。
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
   * Priority Filter変更。
   */
  const handlePriorityChange = (
    event:
      ChangeEvent<HTMLSelectElement>,
  ): void => {
    setPriorityFilter(
      event.target
        .value as PriorityFilter,
    );

    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* =====================================================
       * Task集計
       * ===================================================== */}
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="全タスク"
          value={`${totalCount}件`}
        />

        <SummaryCard
          label="対応中"
          value={`${inProgressCount}件`}
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
          {/* キーワード検索 */}
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
              placeholder="タスク名・案件名・顧客名で検索"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
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

            <option value="todo">
              未着手
            </option>

            <option value="in_progress">
              対応中
            </option>

            <option value="completed">
              完了
            </option>

            <option value="cancelled">
              中止
            </option>
          </select>

          {/* Priority Filter */}
          <select
            value={
              priorityFilter
            }
            onChange={
              handlePriorityChange
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              すべての優先度
            </option>

            <option value="high">
              高
            </option>

            <option value="medium">
              中
            </option>

            <option value="low">
              低
            </option>
          </select>
        </div>
      </section>

      {/* =====================================================
       * Task一覧
       * ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {filteredTasks.length}
            件のタスク
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">
                  タスク
                </th>

                <th className="px-6 py-4">
                  案件
                </th>

                <th className="px-6 py-4">
                  顧客
                </th>

                <th className="px-6 py-4">
                  ステータス
                </th>

                <th className="px-6 py-4">
                  優先度
                </th>

                <th className="px-6 py-4">
                  期限
                </th>

                <th className="px-6 py-4 text-right">
                  操作
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleTasks.map(
                (task) => (
                  <tr
                    key={task.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Task */}
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-800">
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                          {
                            task.description
                          }
                        </p>
                      )}
                    </td>

                    {/* Project */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        {
                          task.projectName
                        }
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {
                        task.customerName
                      }
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <StatusBadge
                        status={
                          task.status
                        }
                      />
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-5">
                      <PriorityBadge
                        priority={
                          task.priority
                        }
                      />
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {
                        task.dueDate ??
                        "未設定"
                      }
                    </td>

                    {/* 操作 */}
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ),
              )}

              {/* Taskが0件 */}
              {visibleTasks.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    条件に一致するタスクはありません。
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
            {filteredTasks.length}
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
 * Task Status Badge。
 */
function StatusBadge({
  status,
}: {
  status: TaskStatus;
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
 * Task Priority Badge。
 */
function PriorityBadge({
  priority,
}: {
  priority: TaskPriority;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        priorityClasses[
          priority
        ],
      ].join(" ")}
    >
      優先度：
      {
        priorityLabels[
          priority
        ]
      }
    </span>
  );
}