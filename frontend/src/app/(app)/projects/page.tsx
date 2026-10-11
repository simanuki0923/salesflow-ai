import Link from "next/link";
import { Plus } from "lucide-react";

import ProjectListClient
  from "@/components/projects/ProjectListClient";

import {
  getProjects,
  mapProject,
} from "@/lib/api/projects";

/**
 * Project一覧ではPostgreSQLの最新状態を表示したい。
 *
 * force-dynamicを指定することで、
 * Build時に固定データを生成するのではなく、
 * Request時にLaravel APIからデータを取得する。
 */
export const dynamic = "force-dynamic";

/**
 * Project一覧ページ。
 *
 * データの流れ：
 *
 * PostgreSQL
 *      ↓
 * Laravel Project API
 * GET /api/v1/projects
 *      ↓
 * getProjects()
 *      ↓
 * mapProject()
 *      ↓
 * ProjectListClient
 */
export default async function ProjectsPage() {
  /**
   * Laravel APIからProject一覧を取得する。
   *
   * 現時点ではFrontend側で既存の
   * 検索・Filter・Pagination UIを使うため、
   * 最大100件を取得している。
   *
   * 将来的にはServer Side Paginationへ変更可能。
   */
  const apiProjects =
    await getProjects({
      perPage: 100,
    });

  /**
   * Laravel ProjectResourceのデータを、
   * 既存ProjectListClientが使用する
   * Project型へ変換する。
   */
  const projects =
    apiProjects.map(
      mapProject,
    );

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            案件管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            案件の進捗・金額・期限を管理します。
          </p>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          新規案件登録
        </Link>
      </section>

      {/*
       * 検索・Status・Priority Filterなど
       * ユーザー操作を伴う部分は
       * Client Componentへ渡す。
       */}
      <ProjectListClient
        projects={projects}
      />
    </div>
  );
}