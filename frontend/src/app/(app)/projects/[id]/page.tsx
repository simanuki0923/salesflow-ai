import { notFound } from "next/navigation";

import ProjectActivity
  from "@/components/projects/ProjectActivity";

import ProjectDetailHeader
  from "@/components/projects/ProjectDetailHeader";

import ProjectOverview
  from "@/components/projects/ProjectOverview";

import ProjectMeetings
  from "@/components/projects/ProjectMeetings";

import ProjectTasks
  from "@/components/projects/ProjectTasks";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getMeetings,
  mapMeeting,
} from "@/lib/api/meetings";

import {
  getProject,
  mapProjectDetail,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import {
  getTasks,
  mapTask,
} from "@/lib/api/tasks";

export const dynamic =
  "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Project詳細Page。
 *
 * Project本体と、
 * Projectに所属するTask / Meetingを
 * Laravel REST APIから取得する。
 *
 * データの流れ：
 *
 * Browser
 * ↓
 * Next.js Server Component
 * ↓
 * Project API
 * ↓
 * Project存在・所有権確認
 * ↓
 * Task API / Meeting API
 * ↓
 * ProjectDetail
 * ↓
 * ProjectTasks / ProjectMeetings
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } =
    await params;

  const projectId =
    Number(id);

  /**
   * URL Parameter Validation。
   *
   * ・整数ではない
   * ・0以下
   *
   * の場合は404。
   */
  if (
    !Number.isInteger(
      projectId,
    ) ||
    projectId <= 0
  ) {
    notFound();
  }

  /**
   * Laravel Session Cookieを取得する。
   *
   * Server ComponentからLaravelへ
   * Login Sessionを転送するため使用する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * まずProject本体を取得する。
   *
   * 先にProjectの存在・所有権を確認することで、
   * 存在しないProject IDに対して
   * Task APIを呼び出すことを防ぐ。
   */
  let apiProject;

  try {
    apiProject =
      await getProject(
        projectId,
        authInit,
      );
  } catch (error) {
    /**
     * Projectが存在しない場合、
     * または他User所有Projectの場合、
     * Laravelは404を返す。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    /**
     * 404以外はNext.js側の
     * Error Handlingへ渡す。
     */
    throw error;
  }

  /**
   * Projectの存在と所有権が確認できた後で、
   * このProjectに所属するTask / Meetingを取得する。
   *
   * Task:
   *
   * GET /api/v1/tasks
   *     ?projectId={projectId}
   *     &perPage=100
   *
   * Meeting:
   *
   * GET /api/v1/meetings
   *     ?projectId={projectId}
   *     &perPage=100
   *
   * TaskとMeetingは相互依存しないため、
   * Promise.all()で並列取得する。
   *
   * Laravel側でも両APIに
   * Login User Scopeが適用される。
   */
  const [
    apiTasks,
    apiMeetings,
  ] = await Promise.all([
    getTasks(
      {
        projectId,
        perPage: 100,
      },
      authInit,
    ),

    getMeetings(
      {
        projectId,
        perPage: 100,
      },
      authInit,
    ),
  ]);

  /**
   * Laravel TaskResource Dataを
   * Frontend UI用Taskへ変換する。
   */
  const tasks =
    apiTasks.map(
      mapTask,
    );

  /**
   * Laravel MeetingResource Dataを
   * Frontend UI用Meetingへ変換する。
   */
  const meetings =
    apiMeetings.map(
      mapMeeting,
    );

  /**
   * Project本体と関連Task / Meetingを
   * ProjectDetailへまとめる。
   *
   * ProjectApiData
   * +
   * Task[]
   * +
   * Meeting[]
   *
   * ↓
   *
   * ProjectDetail
   */
  const project =
    mapProjectDetail(
      apiProject,
      tasks,
      meetings,
    );

  return (
    <div className="space-y-6">
      {/* ================================================
       * Project Header
       * ================================================ */}
      <ProjectDetailHeader
        project={project}
      />

      {/* ================================================
       * Project Overview
       * ================================================ */}
      <ProjectOverview
        project={project}
      />

      {/* ================================================
       * Related Data
       * ================================================ */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/*
         * Laravel Task APIから取得した
         * 実Task Data。
         */}
        <ProjectTasks
          tasks={
            project.tasks
          }
        />

        {/*
         * Laravel Meeting APIから取得した
         * 実Meeting Data。
         */}
        <ProjectMeetings
          meetings={
            project.meetings
          }
        />
      </div>

      {/*
       * ActivityはまだAPI未実装。
       *
       * 現段階ではmapProjectDetail()から
       * 空配列が渡される。
       */}
      <ProjectActivity
        activities={
          project.activities
        }
      />

      {/* ================================================
       * Project Memo
       * ================================================ */}
      {project.notes && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            メモ
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {project.notes}
          </p>
        </section>
      )}
    </div>
  );
}