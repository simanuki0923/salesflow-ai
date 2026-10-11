import Link from "next/link";
import { Plus } from "lucide-react";

import ProjectListClient
  from "@/components/projects/ProjectListClient";

import {
  getProjects,
  mapProject,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

export const dynamic =
  "force-dynamic";

/**
 * Project一覧ページ。
 */
export default async function ProjectsPage() {
  /**
   * Laravel Session Cookieを
   * Server ComponentからLaravelへ転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Login Userが所有するProjectだけが
   * Laravel側のUser Scopeによって返される。
   */
  const apiProjects =
    await getProjects(
      {
        perPage: 100,
      },
      authInit,
    );

  const projects =
    apiProjects.map(
      mapProject,
    );

  return (
    <div className="space-y-6">
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

      <ProjectListClient
        projects={projects}
      />
    </div>
  );
}