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

/**
 * Project詳細ではPostgreSQLの最新状態を表示する。
 *
 * Static Generationで固定せず、
 * Request時にLaravel APIから取得する。
 */
export const dynamic = "force-dynamic";

/**
 * Next.js 16 App Routerでは、
 * Dynamic RouteのparamsをPromiseとして受け取る。
 */
type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Project詳細ページ。
 *
 * データの流れ：
 *
 * URL /projects/{id}
 *      ↓
 * getProject()
 *      ↓
 * Laravel
 * GET /api/v1/projects/{id}
 *      ↓
 * PostgreSQL
 *      ↓
 * mapProjectDetail()
 *      ↓
 * 各表示Component
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  /**
   * URL Parameterを取得する。
   *
   * 例：
   *
   * /projects/10
   *
   * ↓
   *
   * id = "10"
   */
  const { id } = await params;

  const projectId =
    Number(id);

  /**
   * 数字として成立しないIDは、
   * Laravel APIへ送らずNext.js側で404にする。
   */
  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    notFound();
  }

  /**
   * try/catchでは、
   * Laravel API通信だけを扱う。
   *
   * JSXをtry/catchへ含めないことが重要。
   */
  let apiProject;

  try {
    apiProject =
      await getProject(
        projectId,
      );
  } catch (error) {
    /**
     * Laravel Route Model Bindingで
     * Projectが存在しない場合は404になる。
     *
     * Laravel 404
     * ↓
     * Next.js notFound()
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    /**
     * Laravel停止、
     * Network Error、
     * 500 Errorなどは
     * Next.js側のError処理へ渡す。
     */
    throw error;
  }

  /**
   * API取得成功後に、
   * Project詳細画面用の型へ変換する。
   *
   * 現在まだAPI未実装の、
   *
   * tasks
   * activities
   * milestones
   *
   * はmapProjectDetail()内で空配列になる。
   */
  const project =
    mapProjectDetail(
      apiProject,
    );

  /**
   * JSXはtry/catchの外で生成する。
   *
   * React ComponentのRendering Errorは、
   * API Requestのtry/catchで捕捉するものではない。
   */
  return (
    <div className="space-y-6">
      {/* 案件名・顧客名・編集ボタン等 */}
      <ProjectDetailHeader
        project={project}
      />

      {/* 金額・進捗・期間・案件概要 */}
      <ProjectOverview
        project={project}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {/*
         * Task APIは今後実装する。
         * 現段階では空配列を受け取る。
         */}
        <ProjectTasks
          tasks={project.tasks}
        />

        {/*
         * Activity APIも今後実装する。
         */}
        <ProjectActivity
          activities={
            project.activities
          }
        />
      </div>

      {/* メモが登録されている場合だけ表示する */}
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