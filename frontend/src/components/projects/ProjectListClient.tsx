"use client";

import Link from "next/link";
import {
  Search,
  TrendingUp,
} from "lucide-react";
import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";

import type {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

/**
 * ProjectListClientへ渡すProps。
 *
 * projectsにはpage.tsx側から案件一覧を渡す。
 *
 * 現在はMockデータだが、
 * Laravel API導入後も同じProject[]を渡せるようにしておく。
 */
type ProjectListClientProps = {
  projects: Project[];
};

/**
 * ステータス検索条件。
 *
 * all:
 *   すべて
 *
 * その他：
 *   ProjectStatusで定義したステータス
 */
type StatusFilter =
  | "all"
  | ProjectStatus;

/**
 * 優先度検索条件。
 */
type PriorityFilter =
  | "all"
  | ProjectPriority;

/**
 * 1ページあたりの表示件数。
 */
const ITEMS_PER_PAGE = 5;

/**
 * 案件一覧の操作を担当するClient Component。
 *
 * 主な役割：
 *
 * ・案件検索
 * ・ステータスFilter
 * ・優先度Filter
 * ・案件一覧表示
 * ・進捗表示
 * ・Pagination
 *
 * useStateを利用するため、
 * Client Componentとして実装する。
 */
export default function ProjectListClient({
  projects,
}: ProjectListClientProps) {
  /**
   * 検索キーワード。
   */
  const [searchKeyword, setSearchKeyword] =
    useState("");

  /**
   * 案件ステータスFilter。
   */
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  /**
   * 案件優先度Filter。
   */
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");

  /**
   * 現在表示しているページ。
   */
  const [currentPage, setCurrentPage] =
    useState(1);

  /**
   * 検索・ステータス・優先度の条件を使って
   * 表示対象案件を絞り込む。
   *
   * useMemoにより、依存値が変更された場合だけ
   * 再計算する。
   */
  const filteredProjects = useMemo(() => {
    const keyword =
      searchKeyword.trim().toLowerCase();

    return projects.filter((project) => {
      /**
       * 案件名または顧客名に
       * 検索文字列が含まれるか確認する。
       */
      const matchesKeyword =
        keyword === "" ||
        project.name
          .toLowerCase()
          .includes(keyword) ||
        project.customerName
          .toLowerCase()
          .includes(keyword);

      /**
       * 案件ステータスFilter。
       */
      const matchesStatus =
        statusFilter === "all" ||
        project.status === statusFilter;

      /**
       * 優先度Filter。
       */
      const matchesPriority =
        priorityFilter === "all" ||
        project.priority === priorityFilter;

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    projects,
    searchKeyword,
    statusFilter,
    priorityFilter,
  ]);

  /**
   * 総ページ数。
   *
   * 案件が0件の場合でも最低1ページとして扱う。
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProjects.length /
        ITEMS_PER_PAGE,
    ),
  );

  /**
   * 現在ページの開始位置。
   */
  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  /**
   * 現在ページに表示する案件だけ取得する。
   */
  const visibleProjects =
    filteredProjects.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );

  /**
   * 全案件金額を計算する。
   *
   * reduce()を使用して、
   * 全project.amountを合計する。
   */
  const totalAmount = projects.reduce(
    (total, project) =>
      total + project.amount,
    0,
  );

  /**
   * 現在進行中の案件数。
   */
  const inProgressCount =
    projects.filter(
      (project) =>
        project.status === "in_progress",
    ).length;

  /**
   * キーワード変更処理。
   *
   * 検索条件変更時は1ページ目へ戻す。
   */
  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchKeyword(event.target.value);
    setCurrentPage(1);
  };

  /**
   * ステータスFilter変更。
   */
  const handleStatusChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(
      event.target.value as StatusFilter,
    );

    setCurrentPage(1);
  };

  /**
   * 優先度Filter変更。
   */
  const handlePriorityChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setPriorityFilter(
      event.target.value as PriorityFilter,
    );

    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">

      {/* =====================================================
       * 案件集計カード
       * ===================================================== */}
      <section className="grid gap-4 md:grid-cols-3">

        {/* 全案件 */}
        <SummaryCard
          label="全案件"
          value={`${projects.length}件`}
        />

        {/* 進行中 */}
        <SummaryCard
          label="進行中"
          value={`${inProgressCount}件`}
        />

        {/* 案件総額 */}
        <SummaryCard
          label="案件総額"
          value={formatCurrency(totalAmount)}
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
              value={searchKeyword}
              onChange={handleSearchChange}
              placeholder="案件名・顧客名で検索"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>


          {/* ステータス */}
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              すべてのステータス
            </option>

            <option value="draft">
              下書き
            </option>

            <option value="proposal">
              提案中
            </option>

            <option value="negotiation">
              商談中
            </option>

            <option value="in_progress">
              進行中
            </option>

            <option value="completed">
              完了
            </option>

            <option value="cancelled">
              中止
            </option>
          </select>


          {/* 優先度 */}
          <select
            value={priorityFilter}
            onChange={handlePriorityChange}
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
       * 案件一覧
       * ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* 件数 */}
        <div className="border-b border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {filteredProjects.length}
            件の案件
          </p>
        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            {/* Table Header */}
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                <th className="px-6 py-4">
                  案件名
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
                  金額
                </th>

                <th className="px-6 py-4">
                  進捗
                </th>

                <th className="px-6 py-4">
                  期限
                </th>

                <th className="px-6 py-4 text-right">
                  操作
                </th>
              </tr>
            </thead>


            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">

              {visibleProjects.map(
                (project) => (
                  <tr
                    key={project.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* 案件名 */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-semibold text-slate-800 transition hover:text-blue-600"
                      >
                        {project.name}
                      </Link>
                    </td>


                    {/* 顧客 */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/customers/${project.customerId}`}
                        className="text-sm text-slate-600 transition hover:text-blue-600"
                      >
                        {project.customerName}
                      </Link>
                    </td>


                    {/* Status */}
                    <td className="px-6 py-5">
                      <StatusBadge
                        status={project.status}
                      />
                    </td>


                    {/* Priority */}
                    <td className="px-6 py-5">
                      <PriorityBadge
                        priority={
                          project.priority
                        }
                      />
                    </td>


                    {/* 金額 */}
                    <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                      {formatCurrency(
                        project.amount,
                      )}
                    </td>


                    {/* 進捗 */}
                    <td className="px-6 py-5">
                      <div className="w-32">

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {project.progress}%
                          </span>

                          <TrendingUp
                            size={14}
                          />
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  project.progress,
                                ),
                              )}%`,
                            }}
                          />

                        </div>
                      </div>
                    </td>


                    {/* 期限 */}
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {project.dueDate}
                    </td>


                    {/* 詳細 */}
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        詳細
                      </Link>
                    </td>

                  </tr>
                ),
              )}

            </tbody>
          </table>
        </div>


        {/* ===================================================
         * 0件の場合
         * =================================================== */}
        {visibleProjects.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-500">
              条件に一致する案件がありません。
            </p>
          </div>
        )}


        {/* ===================================================
         * Pagination
         * =================================================== */}
        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-slate-500">
            {currentPage} / {totalPages}
            ページ
          </p>

          <div className="flex gap-2">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1),
                )
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              前へ
            </button>

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1,
                  ),
                )
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              次へ
            </button>

          </div>
        </div>

      </section>
    </div>
  );
}


/* =========================================================
 * 共通表示用関数・コンポーネント
 * ========================================================= */

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
 * 案件ステータスBadge。
 */
function StatusBadge({
  status,
}: {
  status: ProjectStatus;
}) {
  const className: Record<
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

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}


/**
 * 優先度Badge。
 */
function PriorityBadge({
  priority,
}: {
  priority: ProjectPriority;
}) {
  const labels: Record<
    ProjectPriority,
    string
  > = {
    high: "高",
    medium: "中",
    low: "低",
  };

  const classes: Record<
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

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}


/**
 * 数値を日本円表示へ変換する。
 *
 * 550000
 *
 * ↓
 *
 * ￥550,000
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
 * 案件一覧上部の集計カード。
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

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}