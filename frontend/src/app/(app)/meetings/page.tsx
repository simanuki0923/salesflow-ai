import Link from "next/link";
import { Plus } from "lucide-react";

import MeetingListClient
  from "@/components/meetings/MeetingListClient";

import {
  getMeetings,
  mapMeeting,
} from "@/lib/api/meetings";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

export const dynamic =
  "force-dynamic";

/**
 * Meeting一覧ページ。
 *
 * データの流れ：
 *
 * Browser
 * ↓
 * Next.js Server Component
 * ↓
 * Laravel Meeting API
 * ↓
 * PostgreSQL
 */
export default async function MeetingsPage() {
  /**
   * Laravel Session Cookieを
   * Server ComponentからAPIへ転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * Login Userが所有するMeetingだけを取得する。
   *
   * Client側で検索・Filter・Paginationを行うため、
   * 最大100件取得する。
   */
  const apiMeetings =
    await getMeetings(
      {
        perPage: 100,
      },
      authInit,
    );

  /**
   * Laravel API Dataから
   * Frontend UI用Meetingへ変換する。
   */
  const meetings =
    apiMeetings.map(
      mapMeeting,
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            商談管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            案件に紐づく商談予定・結果・次回対応を管理します。
          </p>
        </div>

        <Link
          href="/meetings/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          新規商談登録
        </Link>
      </section>

      <MeetingListClient
        meetings={
          meetings
        }
      />
    </div>
  );
}
