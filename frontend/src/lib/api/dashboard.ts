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

/**
 * Dashboard上部の集計情報。
 *
 * Laravel Dashboard APIの、
 *
 * data.summary
 *
 * に対応する。
 */
export type DashboardSummary = {
  customerCount: number;

  projectCount: number;

  inProgressProjectCount: number;

  totalProjectAmount: number;
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
 * Dashboardの「最近の案件」に表示するデータ。
 */
export type DashboardRecentProject = {
  id: number;

  name: string;

  customerName: string;

  status: ProjectStatus;

  amount: number;

  dueDate: string | null;

  updatedAt: string;
};

/**
 * Dashboardの「期限が近い案件」に表示するデータ。
 */
export type DashboardUpcomingProject = {
  id: number;

  name: string;

  customerName: string;

  status: ProjectStatus;

  priority: ProjectPriority;

  dueDate: string | null;
};

/**
 * GET /api/v1/dashboard
 *
 * が返すDashboard全体のデータ。
 */
export type DashboardApiData = {
  summary: DashboardSummary;

  projectStatusCounts:
    DashboardProjectStatusCounts;

  recentProjects:
    DashboardRecentProject[];

  upcomingProjects:
    DashboardUpcomingProject[];
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
 * Laravel auth:sanctum
 *
 * の認証状態を維持したままDashboard APIへ
 * Requestできる。
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