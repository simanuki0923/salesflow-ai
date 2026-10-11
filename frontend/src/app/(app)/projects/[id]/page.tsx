import { notFound } from "next/navigation";

import ProjectActivity
  from "@/components/projects/ProjectActivity";

import ProjectDetailHeader
  from "@/components/projects/ProjectDetailHeader";

import ProjectOverview
  from "@/components/projects/ProjectOverview";

import ProjectTasks
  from "@/components/projects/ProjectTasks";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getProject,
  mapProjectDetail,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

export const dynamic =
  "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Project詳細ページ。
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  const projectId =
    Number(id);

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
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * API Requestだけをtry/catchする。
   *
   * JSXはtry/catchに入れない。
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
     * Projectが存在しない、
     * または他User所有Projectなら404。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  const project =
    mapProjectDetail(
      apiProject,
    );

  return (
    <div className="space-y-6">
      <ProjectDetailHeader
        project={project}
      />

      <ProjectOverview
        project={project}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectTasks
          tasks={project.tasks}
        />

        <ProjectActivity
          activities={
            project.activities
          }
        />
      </div>

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