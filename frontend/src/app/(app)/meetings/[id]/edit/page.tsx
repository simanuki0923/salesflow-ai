import { notFound } from "next/navigation";

import MeetingForm
  from "@/components/meetings/MeetingForm";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getMeeting,
} from "@/lib/api/meetings";

import {
  getProjects,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  MeetingFormData,
  MeetingProjectOption,
} from "@/types/meeting";

export const dynamic =
  "force-dynamic";

type MeetingEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Laravel MeetingResourceのISO 8601日時を
 * input type="datetime-local"用へ変換する。
 *
 * 例：
 *
 * 2026-11-10T14:00:00.000000Z
 *
 * ↓
 *
 * 2026-11-10T14:00
 *
 * Date ObjectによるTime Zone変換は行わず、
 * Backendに保存されたWall Clock時刻を維持する。
 */
function toDateTimeLocalValue(
  value: string,
): string {
  return value
    .replace(
      " ",
      "T",
    )
    .slice(
      0,
      16,
    );
}

/**
 * Meeting編集ページ。
 */
export default async function MeetingEditPage({
  params,
}: MeetingEditPageProps) {
  const { id } =
    await params;

  const meetingId =
    Number(id);

  /**
   * 不正なURL Parameterは404。
   */
  if (
    !Number.isInteger(
      meetingId,
    ) ||
    meetingId <= 0
  ) {
    notFound();
  }

  /**
   * Meeting API / Project APIへ
   * Laravel Session Cookieを転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  let meeting;
  let projects;

  try {
    /**
     * MeetingとProject一覧は
     * 相互依存しないため並列取得する。
     */
    [
      meeting,
      projects,
    ] = await Promise.all([
      getMeeting(
        meetingId,
        authInit,
      ),

      getProjects(
        {
          perPage: 100,
        },
        authInit,
      ),
    ]);
  } catch (error) {
    /**
     * Meetingが存在しない、
     * または他User所有の場合、
     * Backendは404を返す。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  /**
   * MeetingFormのProject Select用Data。
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

  /**
   * Laravel Meeting API Dataを
   * HTML Form用Dataへ変換する。
   *
   * projectId:
   *   number → string
   *
   * durationMinutes:
   *   number | null → string
   *
   * nullable Text:
   *   null → ""
   *
   * scheduledAt:
   *   ISO 8601 → datetime-local
   */
  const initialData:
    MeetingFormData = {
    projectId:
      String(
        meeting.projectId,
      ),

    title:
      meeting.title,

    description:
      meeting.description ?? "",

    status:
      meeting.status,

    method:
      meeting.method,

    scheduledAt:
      toDateTimeLocalValue(
        meeting.scheduledAt,
      ),

    durationMinutes:
      meeting.durationMinutes ===
        null
        ? ""
        : String(
            meeting.durationMinutes,
          ),

    location:
      meeting.location ?? "",

    result:
      meeting.result ?? "",

    nextAction:
      meeting.nextAction ?? "",
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          商談情報を編集
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          登録されている商談予定・結果・次回対応を変更します。
        </p>
      </section>

      <MeetingForm
        mode="edit"
        meetingId={
          meetingId
        }
        projectOptions={
          projectOptions
        }
        initialData={
          initialData
        }
      />
    </div>
  );
}
