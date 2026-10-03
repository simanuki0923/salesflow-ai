import { notFound } from "next/navigation";

import ProjectActivity from "@/components/projects/ProjectActivity";
import ProjectDetailHeader from "@/components/projects/ProjectDetailHeader";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectTasks from "@/components/projects/ProjectTasks";

import { findProjectDetailById } from "@/lib/mock/projectDetails";

/**
 * Dynamic Routeから受け取るURLパラメータ。
 *
 * 例：
 *
 * /projects/1
 *
 * ↓
 *
 * id = "1"
 *
 * Next.js 16ではparamsをPromiseとして扱う。
 */
type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * SalesFlow AI 案件詳細ページ。
 *
 * URLから案件IDを取得し、
 * 対象案件の詳細情報を表示する。
 *
 * 現在：
 *
 * Mock Data
 *
 * ↓
 *
 * 将来：
 *
 * Laravel
 * GET /api/v1/projects/{id}
 *
 * へ変更する。
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  /**
   * Dynamic Routeのパラメータを取得する。
   */
  const { id } = await params;

  /**
   * URLパラメータはstringなのでnumberへ変換。
   */
  const projectId = Number(id);

  /**
   * 正の整数ではないIDの場合は404。
   */
  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    notFound();
  }

  /**
   * 現在はMockデータから案件を取得する。
   */
  const project =
    findProjectDetailById(projectId);

  /**
   * 案件が存在しない場合も404。
   */
  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
       * 案件詳細Header
       * ===================================================== */}
      <ProjectDetailHeader
        project={project}
      />


      {/* =====================================================
       * 画面内Navigation
       *
       * 現段階では同一ページ内のSectionへ移動する。
       * ===================================================== */}
      <nav className="overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">

        <div className="flex min-w-max gap-2">

          <a
            href="#overview"
            className="border-b-2 border-blue-600 px-4 py-4 text-sm font-semibold text-blue-600"
          >
            基本情報
          </a>

          <a
            href="#tasks"
            className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            タスク
          </a>

          <a
            href="#activity"
            className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            活動履歴
          </a>

          <a
            href="#notes"
            className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            メモ
          </a>

        </div>
      </nav>


      {/* =====================================================
       * Detail Layout
       *
       * PC：
       * 左を広めにした2Column
       *
       * Mobile：
       * 1Column
       * ===================================================== */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">

        {/* 左Column */}
        <div className="space-y-6">

          {/* 案件概要・進捗・Schedule */}
          <ProjectOverview
            project={project}
          />

          {/* 関連Task */}
          <ProjectTasks
            tasks={project.tasks}
          />

        </div>


        {/* 右Column */}
        <div className="space-y-6">

          {/* Activity */}
          <ProjectActivity
            activities={
              project.activities
            }
          />


          {/* =================================================
           * Memo
           * ================================================= */}
          <section
            id="notes"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <h2 className="text-xl font-bold text-slate-900">
              メモ
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {project.notes ??
                "メモは登録されていません。"}
            </p>

          </section>

        </div>

      </section>

    </div>
  );
}