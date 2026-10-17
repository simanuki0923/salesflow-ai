import Link from "next/link";

import {
  Banknote,
  BriefcaseBusiness,
  Clock3,
  Users,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  getDashboard,
} from "@/lib/api/dashboard";

import type {
  DashboardProjectStatusCounts,
  DashboardTaskStatusCounts,
} from "@/lib/api/dashboard";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

import type {
  TaskPriority,
  TaskStatus,
} from "@/types/task";

/**
 * DashboardはPostgreSQLの最新情報を表示するため、
 * RequestごとにServer Componentを実行する。
 */
export const dynamic =
  "force-dynamic";

/**
 * Dashboard上部に表示する
 * 集計カード1件分の型。
 */
type SummaryCard = {
  /**
   * カードタイトル。
   */
  title: string;

  /**
   * カードへ表示する主な値。
   */
  value: string;

  /**
   * 「件」などの単位。
   */
  unit: string;

  /**
   * カード下部へ表示する補足情報。
   */
  description: string;

  /**
   * lucide-reactのIcon Component。
   */
  icon: LucideIcon;

  /**
   * Icon背景・文字色。
   */
  iconClass: string;

  /**
   * 補足表示の背景・文字色。
   */
  descriptionClass: string;
};

/**
 * Dashboardの案件ステータス表示用。
 */
type ProjectStatusItem = {
  /**
   * Laravel Dashboard APIの
   * projectStatusCountsと対応するKey。
   */
  key:
    keyof DashboardProjectStatusCounts;

  /**
   * 日本語表示名。
   */
  label: string;

  /**
   * 該当ステータスの案件数。
   */
  count: number;

  /**
   * 凡例で使用するTailwind CSS。
   */
  colorClass: string;

  /**
   * ドーナツグラフで使用する色。
   */
  chartColor: string;
};

/**
 * DashboardのTaskステータス表示用。
 */
type TaskStatusItem = {
  /**
   * Laravel Dashboard APIの
   * taskStatusCountsと対応するKey。
   */
  key:
    keyof DashboardTaskStatusCounts;

  /**
   * 日本語表示名。
   */
  label: string;

  /**
   * 該当StatusのTask件数。
   */
  count: number;

  /**
   * 凡例で使用するTailwind CSS。
   */
  colorClass: string;

  /**
   * ドーナツグラフで使用する色。
   */
  chartColor: string;
};

/**
 * 数値を日本円表示へ変換する。
 *
 * 例：
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
 * YYYY-MM-DD形式の日付を
 * Dashboard表示用へ変換する。
 *
 * Date Objectへ変換するとTime Zoneの影響を
 * 受ける可能性があるため、
 * 日付だけの場合は文字列として整形する。
 *
 * 例：
 *
 * 2026-10-15
 *
 * ↓
 *
 * 2026/10/15
 */
function formatDate(
  date: string | null,
): string {
  if (date === null) {
    return "未設定";
  }

  return date.replaceAll(
    "-",
    "/",
  );
}

/**
 * Laravelから取得したISO 8601 DateTimeを
 * 日本時間の日付表示へ変換する。
 */
function formatUpdatedDate(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "ja-JP",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    },
  ).format(
    new Date(date),
  );
}

/**
 * Project Statusを日本語表示へ変換する。
 *
 * Backend / Frontendでは、
 *
 * draft
 * proposal
 * negotiation
 * in_progress
 * completed
 * cancelled
 *
 * の6種類を共通して使用する。
 */
function getProjectStatusLabel(
  status: ProjectStatus,
): string {
  switch (status) {
    case "draft":
      return "下書き";

    case "proposal":
      return "提案中";

    case "negotiation":
      return "交渉中";

    case "in_progress":
      return "進行中";

    case "completed":
      return "完了";

    case "cancelled":
      return "中止";
  }
}

/**
 * Project / Task Priorityを
 * 日本語表示へ変換する。
 *
 * ProjectとTaskは同じ
 *
 * high
 * medium
 * low
 *
 * を使用しているため共通化する。
 */
function getPriorityLabel(
  priority:
    | ProjectPriority
    | TaskPriority,
): string {
  switch (priority) {
    case "high":
      return "高";

    case "medium":
      return "中";

    case "low":
      return "低";
  }
}

/**
 * Project / Task Priorityごとの
 * 表示Classを取得する。
 */
function getPriorityClass(
  priority:
    | ProjectPriority
    | TaskPriority,
): string {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-500";

    case "medium":
      return "bg-orange-50 text-orange-500";

    case "low":
      return "bg-emerald-50 text-emerald-600";
  }
}

/**
 * Task Statusを日本語表示へ変換する。
 */
function getTaskStatusLabel(
  status: TaskStatus,
): string {
  switch (status) {
    case "todo":
      return "未着手";

    case "in_progress":
      return "対応中";

    case "completed":
      return "完了";

    case "cancelled":
      return "中止";
  }
}

/**
 * Task Statusごとの表示Class。
 */
function getTaskStatusClass(
  status: TaskStatus,
): string {
  switch (status) {
    case "todo":
      return "bg-slate-100 text-slate-600";

    case "in_progress":
      return "bg-blue-50 text-blue-600";

    case "completed":
      return "bg-emerald-50 text-emerald-600";

    case "cancelled":
      return "bg-rose-50 text-rose-600";
  }
}

/**
 * Project Statusの件数から
 * CSSのconic-gradientを生成する。
 *
 * グラフライブラリを追加せず、
 * 既存Dashboardデザインを維持したまま
 * DBの実データをドーナツグラフへ反映する。
 */
function createProjectStatusGradient(
  statuses: ProjectStatusItem[],
): string {
  /**
   * 全Statusの件数を合計する。
   */
  const total =
    statuses.reduce(
      (
        sum,
        status,
      ) =>
        sum + status.count,
      0,
    );

  /**
   * Projectが1件も存在しない場合。
   *
   * 0除算を防ぎ、
   * 空のDashboardでもグラフ領域を維持する。
   */
  if (total === 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let currentDegree = 0;

  /**
   * 各Statusの件数割合を
   * 360度へ変換する。
   */
  const segments =
    statuses.map(
      (status) => {
        const startDegree =
          currentDegree;

        const degree =
          (
            status.count /
            total
          ) * 360;

        currentDegree +=
          degree;

        return [
          status.chartColor,
          `${startDegree}deg`,
          `${currentDegree}deg`,
        ].join(" ");
      },
    );

  return `conic-gradient(${segments.join(", ")})`;
}

/**
 * Task Statusの件数から
 * CSSのconic-gradientを生成する。
 */
function createTaskStatusGradient(
  statuses: TaskStatusItem[],
): string {
  /**
   * 全Task Status件数を合計する。
   */
  const total =
    statuses.reduce(
      (
        sum,
        status,
      ) =>
        sum + status.count,
      0,
    );

  /**
   * Taskが1件も存在しない場合。
   *
   * 0除算を防ぎ、
   * 空のDashboardでもグラフ領域を維持する。
   */
  if (total === 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let currentDegree = 0;

  /**
   * 各Statusの件数割合を
   * 360度へ変換する。
   */
  const segments =
    statuses.map(
      (status) => {
        const startDegree =
          currentDegree;

        const degree =
          (
            status.count /
            total
          ) * 360;

        currentDegree +=
          degree;

        return [
          status.chartColor,
          `${startDegree}deg`,
          `${currentDegree}deg`,
        ].join(" ");
      },
    );

  return `conic-gradient(${segments.join(", ")})`;
}

/**
 * SalesFlow AI Dashboard。
 *
 * Laravel Dashboard APIから、
 * Login Userが所有する
 * Customer / Project / Taskの
 * 集計情報を取得して表示する。
 *
 * データの流れ：
 *
 * PostgreSQL
 *      ↓
 * Customer / Project / Task
 *      ↓
 * Laravel
 * GET /api/v1/dashboard
 *      ↓
 * auth:sanctum
 *      ↓
 * getDashboard()
 *      ↓
 * Next.js Server Component
 *      ↓
 * Dashboard UI
 */
export default async function DashboardPage() {
  /**
   * BrowserからNext.js Server Componentへ届いた
   * Laravel Session Cookieを取得する。
   *
   * Server ComponentからLaravelへRequestするときは
   * Browser Cookieが自動転送されないため、
   * getServerAuthRequestInit()を利用する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Laravel Dashboard APIから、
   * Login User専用のDashboard情報を取得する。
   */
  const dashboard =
    await getDashboard(
      authInit,
    );

  /**
   * Dashboard API Responseから、
   *
   * ・Summary
   * ・Project Status
   * ・Task Status
   * ・最近のProject
   * ・期限が近いProject
   * ・期限が近いTask
   *
   * を取り出す。
   */
  const {
    summary,
    projectStatusCounts,
    taskStatusCounts,
    recentProjects,
    upcomingProjects,
    upcomingTasks,
  } = dashboard;

  /**
   * Dashboard上部へ表示する4つの集計カード。
   *
   * 以前のMockでは前月比を表示していたが、
   * 現在は前月データを保存・比較していないため、
   * 架空の増減率は表示しない。
   */
  const summaryCards:
    SummaryCard[] = [
    {
      title:
        "顧客数",

      value:
        String(
          summary.customerCount,
        ),

      unit:
        "件",

      description:
        "登録済み顧客",

      icon:
        Users,

      iconClass:
        "bg-emerald-100 text-emerald-600",

      descriptionClass:
        "bg-emerald-50 text-emerald-600",
    },

    {
      title:
        "案件数",

      value:
        String(
          summary.projectCount,
        ),

      unit:
        "件",

      description:
        "全案件",

      icon:
        BriefcaseBusiness,

      iconClass:
        "bg-blue-100 text-blue-600",

      descriptionClass:
        "bg-blue-50 text-blue-600",
    },

    {
      title:
        "進行中案件",

      value:
        String(
          summary
            .inProgressProjectCount,
        ),

      unit:
        "件",

      description:
        "現在進行中",

      icon:
        Clock3,

      iconClass:
        "bg-orange-100 text-orange-600",

      descriptionClass:
        "bg-orange-50 text-orange-600",
    },

    {
      title:
        "案件総額",

      value:
        formatCurrency(
          summary
            .totalProjectAmount,
        ),

      unit:
        "",

      description:
        "登録案件の合計",

      icon:
        Banknote,

      iconClass:
        "bg-violet-100 text-violet-600",

      descriptionClass:
        "bg-violet-50 text-violet-600",
    },
  ];

  /**
   * Laravel Dashboard APIのProject Status集計を、
   * Dashboard表示用データへ変換する。
   */
  const projectStatuses:
    ProjectStatusItem[] = [
    {
      key:
        "proposal",

      label:
        "提案中",

      count:
        projectStatusCounts
          .proposal,

      colorClass:
        "bg-blue-600",

      chartColor:
        "#2563eb",
    },

    {
      key:
        "negotiation",

      label:
        "交渉中",

      count:
        projectStatusCounts
          .negotiation,

      colorClass:
        "bg-cyan-400",

      chartColor:
        "#22d3ee",
    },

    {
      key:
        "inProgress",

      label:
        "進行中",

      count:
        projectStatusCounts
          .inProgress,

      colorClass:
        "bg-blue-400",

      chartColor:
        "#60a5fa",
    },

    {
      key:
        "completed",

      label:
        "完了",

      count:
        projectStatusCounts
          .completed,

      colorClass:
        "bg-green-400",

      chartColor:
        "#4ade80",
    },

    {
      key:
        "draft",

      label:
        "下書き",

      count:
        projectStatusCounts
          .draft,

      colorClass:
        "bg-amber-400",

      chartColor:
        "#fbbf24",
    },

    {
      key:
        "cancelled",

      label:
        "中止",

      count:
        projectStatusCounts
          .cancelled,

      colorClass:
        "bg-rose-400",

      chartColor:
        "#fb7185",
    },
  ];

  /**
   * Laravel Dashboard APIのTask Status集計を、
   * Dashboard表示用データへ変換する。
   *
   * Taskで使用するStatus：
   *
   * todo
   * in_progress
   * completed
   * cancelled
   */
  const taskStatuses:
    TaskStatusItem[] = [
    {
      key:
        "todo",

      label:
        "未着手",

      count:
        taskStatusCounts
          .todo,

      colorClass:
        "bg-slate-400",

      chartColor:
        "#94a3b8",
    },

    {
      key:
        "inProgress",

      label:
        "対応中",

      count:
        taskStatusCounts
          .inProgress,

      colorClass:
        "bg-blue-500",

      chartColor:
        "#3b82f6",
    },

    {
      key:
        "completed",

      label:
        "完了",

      count:
        taskStatusCounts
          .completed,

      colorClass:
        "bg-emerald-400",

      chartColor:
        "#34d399",
    },

    {
      key:
        "cancelled",

      label:
        "中止",

      count:
        taskStatusCounts
          .cancelled,

      colorClass:
        "bg-rose-400",

      chartColor:
        "#fb7185",
    },
  ];

  /**
   * Project Status件数から
   * ドーナツグラフ背景を生成する。
   */
  const projectStatusGradient =
    createProjectStatusGradient(
      projectStatuses,
    );

  /**
   * Task Status件数から
   * ドーナツグラフ背景を生成する。
   */
  const taskStatusGradient =
    createTaskStatusGradient(
      taskStatuses,
    );

  return (
    <div className="space-y-6">
      {/* =============================================
       * ページタイトル
       * ============================================= */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          ダッシュボード
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          営業活動の状況をまとめて確認できます。
        </p>
      </section>

      {/* =============================================
       * Dashboard上部 集計カード
       * ============================================= */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          (card) => {
            /**
             * SummaryCardへ保持した
             * Lucide Icon Component。
             */
            const Icon =
              card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <div className="mt-4 flex items-end gap-1">
                      <span className="break-all text-3xl font-bold text-slate-900 xl:text-4xl">
                        {card.value}
                      </span>

                      {card.unit !== "" && (
                        <span className="mb-1 text-sm font-semibold text-slate-600">
                          {card.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon
                      size={22}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${card.descriptionClass}`}
                  >
                    {card.description}
                  </span>
                </div>
              </div>
            );
          },
        )}
      </section>

      {/* =============================================
       * Dashboardメイン領域
       *
       * PCでは2列、
       * 小さい画面では1列表示する。
       * ============================================= */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* ===========================================
         * 案件ステータス
         * =========================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              案件ステータス
            </h2>

            <Link
              href="/projects"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              案件一覧
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
            {/* 実案件件数から生成したドーナツグラフ */}
            <div
              className="relative flex h-52 w-52 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  projectStatusGradient,
              }}
            >
              {/* ドーナツ中央 */}
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-900">
                  {
                    summary
                      .projectCount
                  }
                  件
                </span>

                <span className="text-sm text-slate-400">
                  総計
                </span>
              </div>
            </div>

            {/* Status凡例 */}
            <div className="w-full space-y-4">
              {projectStatuses.map(
                (status) => (
                  <div
                    key={status.key}
                    className="flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded ${status.colorClass}`}
                      />

                      <span className="text-sm text-slate-600">
                        {
                          status.label
                        }
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-800">
                      {
                        status.count
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ===========================================
         * Taskステータス
         * =========================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              タスクステータス
            </h2>

            <Link
              href="/tasks"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              タスク一覧
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
            {/* 実Task件数から生成したドーナツグラフ */}
            <div
              className="relative flex h-52 w-52 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  taskStatusGradient,
              }}
            >
              {/* ドーナツ中央 */}
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-900">
                  {
                    summary
                      .taskCount
                  }
                  件
                </span>

                <span className="text-sm text-slate-400">
                  総計
                </span>
              </div>
            </div>

            {/* Task Status凡例 */}
            <div className="w-full space-y-4">
              {taskStatuses.map(
                (status) => (
                  <div
                    key={status.key}
                    className="flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded ${status.colorClass}`}
                      />

                      <span className="text-sm text-slate-600">
                        {
                          status.label
                        }
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-800">
                      {
                        status.count
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ===========================================
         * 期限が近い案件
         * =========================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              期限が近い案件
            </h2>

            <Link
              href="/projects"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              すべて見る
            </Link>
          </div>

          {upcomingProjects.length ===
          0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              期限が近い案件はありません。
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {upcomingProjects.map(
                (project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      {/* 案件詳細へのLink */}
                      <Link
                        href={`/projects/${project.id}`}
                        className="block truncate text-sm font-semibold text-slate-700 hover:text-blue-600"
                      >
                        {
                          project.name
                        }
                      </Link>

                      {/* 顧客名 */}
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {
                          project
                            .customerName
                        }
                      </p>
                    </div>

                    {/* 期限 */}
                    <span className="hidden text-sm text-slate-400 sm:block">
                      {formatDate(
                        project
                          .dueDate,
                      )}
                    </span>

                    {/* 優先度 */}
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        getPriorityClass(
                          project
                            .priority,
                        ),
                      ].join(" ")}
                    >
                      {getPriorityLabel(
                        project
                          .priority,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ===========================================
         * 期限が近いTask
         * =========================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              期限が近いタスク
            </h2>

            <Link
              href="/tasks"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              すべて見る
            </Link>
          </div>

          {upcomingTasks.length ===
          0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              期限が近いタスクはありません。
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {upcomingTasks.map(
                (task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      {/* Task編集画面へのLink */}
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="block truncate text-sm font-semibold text-slate-700 hover:text-blue-600"
                      >
                        {
                          task.title
                        }
                      </Link>

                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        {/* Project詳細へのLink */}
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="truncate hover:text-blue-600"
                        >
                          {
                            task.projectName
                          }
                        </Link>

                        <span>
                          /
                        </span>

                        {/* Customer名 */}
                        <span className="truncate">
                          {
                            task.customerName
                          }
                        </span>
                      </div>
                    </div>

                    {/* Task期限 */}
                    <span className="hidden text-sm text-slate-400 sm:block">
                      {formatDate(
                        task.dueDate,
                      )}
                    </span>

                    {/* Task Status */}
                    <span
                      className={[
                        "hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex",
                        getTaskStatusClass(
                          task.status,
                        ),
                      ].join(" ")}
                    >
                      {getTaskStatusLabel(
                        task.status,
                      )}
                    </span>

                    {/* Task Priority */}
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        getPriorityClass(
                          task.priority,
                        ),
                      ].join(" ")}
                    >
                      {getPriorityLabel(
                        task.priority,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ===========================================
         * 最近の案件
         * =========================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              最近の案件
            </h2>

            <Link
              href="/projects"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              すべて見る
            </Link>
          </div>

          {recentProjects.length ===
          0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              案件はまだ登録されていません。
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {recentProjects.map(
                (project) => (
                  <div
                    key={project.id}
                    className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_1.2fr_auto]"
                  >
                    <div className="min-w-0">
                      {/* 案件名 */}
                      <Link
                        href={`/projects/${project.id}`}
                        className="block truncate font-semibold text-slate-700 hover:text-blue-600"
                      >
                        {
                          project.name
                        }
                      </Link>

                      {/* 顧客名 */}
                      <span className="mt-1 block truncate text-xs text-slate-400">
                        {
                          project
                            .customerName
                        }
                      </span>
                    </div>

                    <div>
                      {/* 案件金額 */}
                      <p className="font-medium text-slate-600">
                        {formatCurrency(
                          project
                            .amount,
                        )}
                      </p>

                      {/* 案件Status */}
                      <p className="mt-1 text-xs text-slate-400">
                        {getProjectStatusLabel(
                          project
                            .status,
                        )}
                      </p>
                    </div>

                    {/* 最終更新日 */}
                    <span className="text-slate-400">
                      {formatUpdatedDate(
                        project
                          .updatedAt,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ===========================================
         * 営業データ概要
         *
         * Taskは実データ連携済み。
         *
         * Meeting / Notification APIは
         * まだ実装していないため、
         * それらのMock表示は行わない。
         * =========================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            営業データ概要
          </h2>

          <div className="mt-5 space-y-4">
            {/* Customer数 */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">
                登録顧客
              </span>

              <span className="font-bold text-slate-900">
                {
                  summary
                    .customerCount
                }
                件
              </span>
            </div>

            {/* Project総数 */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">
                全案件
              </span>

              <span className="font-bold text-slate-900">
                {
                  summary
                    .projectCount
                }
                件
              </span>
            </div>

            {/* 進行中Project */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">
                進行中案件
              </span>

              <span className="font-bold text-slate-900">
                {
                  summary
                    .inProgressProjectCount
                }
                件
              </span>
            </div>

            {/* Task総数 */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">
                全タスク
              </span>

              <span className="font-bold text-slate-900">
                {
                  summary
                    .taskCount
                }
                件
              </span>
            </div>

            {/* 対応中Task */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">
                対応中タスク
              </span>

              <span className="font-bold text-slate-900">
                {
                  summary
                    .inProgressTaskCount
                }
                件
              </span>
            </div>

            {/* Project総額 */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">
                案件総額
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(
                  summary
                    .totalProjectAmount,
                )}
              </span>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-slate-400">
            商談・通知機能は今後のAPI実装後にDashboardへ追加します。
          </p>
        </div>
      </section>
    </div>
  );
}