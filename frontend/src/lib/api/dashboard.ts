import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiResourceResponse,
} from "@/lib/api/types";

import type {
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

import type {
  TaskPriority,
  TaskStatus,
} from "@/types/task";

/**
 * Dashboard上部の集計情報。
 *
 * Laravel Dashboard APIの、
 *
 * data.summary
 *
 * に対応する。
 *
 * Customer / Projectだけでなく、
 * Taskの集計情報もDashboard APIから取得する。
 */
export type DashboardSummary = {
  /** 登録Customer総数 */
  customerCount: number;

  /** 登録Project総数 */
  projectCount: number;

  /** in_progress状態のProject数 */
  inProgressProjectCount: number;

  /** Login User所有Projectの総額 */
  totalProjectAmount: number;

  /** 登録Task総数 */
  taskCount: number;

  /** in_progress状態のTask数 */
  inProgressTaskCount: number;
};

/**
 * Project Statusごとの件数。
 *
 * Laravel側のsnake_caseではなく、
 * Dashboard APIが返すcamelCaseに合わせる。
 */
export type DashboardProjectStatusCounts = {
  draft: number;

  proposal: number;

  negotiation: number;

  inProgress: number;

  completed: number;

  cancelled: number;
};

/**
 * Task Statusごとの件数。
 *
 * BackendのTask Domainでは、
 *
 * todo
 * in_progress
 * completed
 * cancelled
 *
 * の4種類を使用する。
 *
 * Dashboard APIではFrontendで扱いやすいよう、
 * in_progressをinProgressとして返す。
 */
export type DashboardTaskStatusCounts = {
  todo: number;

  inProgress: number;

  completed: number;

  cancelled: number;
};

/**
 * Dashboardの「最近の案件」に表示するデータ。
 */
export type DashboardRecentProject = {
  /** Project ID */
  id: number;

  /** Project名 */
  name: string;

  /** Customer名 */
  customerName: string;

  /** Project Status */
  status: ProjectStatus;

  /** Project金額 */
  amount: number;

  /** Project期限 */
  dueDate: string | null;

  /** 最終更新日時 */
  updatedAt: string;
};

/**
 * Dashboardの「期限が近い案件」に表示するデータ。
 */
export type DashboardUpcomingProject = {
  /** Project ID */
  id: number;

  /** Project名 */
  name: string;

  /** Customer名 */
  customerName: string;

  /** Project Status */
  status: ProjectStatus;

  /** Project Priority */
  priority: ProjectPriority;

  /** Project期限 */
  dueDate: string | null;
};

/**
 * Dashboardの「期限が近いTask」に表示するデータ。
 *
 * Laravel Dashboard APIの、
 *
 * data.upcomingTasks
 *
 * に対応する。
 *
 * Dashboardから、
 *
 * ・Task編集画面
 * ・Project詳細画面
 *
 * へ遷移できるよう、
 * Project ID / Project名 / Customer名も保持する。
 */
export type DashboardUpcomingTask = {
  /** Task ID */
  id: number;

  /** Taskが所属するProject ID */
  projectId: number;

  /** Taskが所属するProject名 */
  projectName: string;

  /** Projectを所有するCustomer名 */
  customerName: string;

  /** Task名 */
  title: string;

  /** Task Status */
  status: TaskStatus;

  /** Task Priority */
  priority: TaskPriority;

  /** Task期限 */
  dueDate: string | null;
};

/**
 * GET /api/v1/dashboard
 *
 * が返すDashboard全体のデータ。
 *
 * Backend側DashboardControllerのResponse構造と
 * 必ず一致させる。
 *
 * data
 * ├─ summary
 * ├─ projectStatusCounts
 * ├─ taskStatusCounts
 * ├─ recentProjects
 * ├─ upcomingProjects
 * └─ upcomingTasks
 */
export type DashboardApiData = {
  /** Dashboard上部の集計情報 */
  summary: DashboardSummary;

  /** Project Status別件数 */
  projectStatusCounts:
    DashboardProjectStatusCounts;

  /** Task Status別件数 */
  taskStatusCounts:
    DashboardTaskStatusCounts;

  /** 最近更新されたProject */
  recentProjects:
    DashboardRecentProject[];

  /** 期限が近いProject */
  upcomingProjects:
    DashboardUpcomingProject[];

  /** 期限が近いTask */
  upcomingTasks:
    DashboardUpcomingTask[];
};

/**
 * Dashboard情報を取得する。
 *
 * Next.js Server Componentから呼び出す場合は、
 * getServerAuthRequestInit()で取得したRequestInitを
 * 第1引数へ渡す。
 *
 * これにより、
 *
 * Browser
 *   ↓ Laravel Session Cookie
 * Next.js Server Component
 *   ↓
 * getDashboard()
 *   ↓
 * GET /api/v1/dashboard
 *   ↓
 * Laravel auth:sanctum
 *
 * の認証状態を維持したままDashboard APIへ
 * Requestできる。
 *
 * Backend側ですでにcamelCaseへ変換しているため、
 * このFunctionでは追加のmap処理は行わず、
 * response.dataをそのまま返す。
 */
export async function getDashboard(
  init: RequestInit = {},
): Promise<DashboardApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<DashboardApiData>
    >(
      "/dashboard",
      init,
    );

  return response.data;
}