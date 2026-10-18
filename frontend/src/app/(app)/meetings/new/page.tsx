import MeetingForm
  from "@/components/meetings/MeetingForm";

import {
  getProjects,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  MeetingProjectOption,
} from "@/types/meeting";

export const dynamic =
  "force-dynamic";

/**
 * Meeting新規登録ページ。
 *
 * Meetingは必ずProjectへ所属するため、
 * Login User所有Project一覧を取得して
 * Formの選択肢として使用する。
 */
export default async function MeetingCreatePage() {
  /**
   * Server ComponentからLaravelへ
   * Session Cookieを転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Laravel側でUser Scopeされた
   * Project一覧を取得する。
   */
  const projects =
    await getProjects(
      {
        perPage: 100,
      },
      authInit,
    );

  /**
   * MeetingFormのProject Select用Dataへ変換する。
   */
  const projectOptions:
    MeetingProjectOption[] =
    projects.map(
      (project) => ({
        id:
          project.id,

        name:
          project.name,

        customerName:
          project.customerName,
      }),
    );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          新規商談登録
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          案件に紐づく新しい商談予定を登録します。
        </p>
      </section>

      <MeetingForm
        mode="create"
        projectOptions={
          projectOptions
        }
      />
    </div>
  );
}
