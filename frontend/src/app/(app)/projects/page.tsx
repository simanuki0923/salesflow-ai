import Link from "next/link";
import { Plus } from "lucide-react";

import ProjectListClient from "@/components/projects/ProjectListClient";
import { projects } from "@/lib/mock/projects";

/**
 * SalesFlow AI 案件管理一覧ページ。
 *
 * このpage.tsx自体はServer Componentとして動作する。
 *
 * 検索・Filter・Paginationなど、
 * ブラウザ上で状態管理が必要な処理だけ
 * ProjectListClientへ分離している。
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
 * GET /api/v1/projects
 *
 * から案件一覧を取得する。
 */
export default function ProjectsPage() {
  return (
    <div className="space-y-6">

      {/* =====================================================
       * ページヘッダー
       * ===================================================== */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            案件管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            案件の進行状況・金額・期限を管理します。
          </p>
        </div>


        {/* 新規案件登録 */}
        <Link
          href="/projects/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          新規案件登録
        </Link>

      </section>


      {/* =====================================================
       * 案件一覧
       *
       * 現在はMockデータ。
       * ===================================================== */}
      <ProjectListClient
        projects={projects}
      />

    </div>
  );
}