import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiCollectionResponse,
  ApiResourceResponse,
} from "@/lib/api/types";

import type {
  Meeting,
  MeetingFormData,
  MeetingMethod,
  MeetingStatus,
} from "@/types/meeting";

/**
 * Laravel MeetingResourceが返すJSON。
 *
 * BackendではDBのsnake_caseを
 * MeetingResourceによってcamelCaseへ
 * 変換して返している。
 */
export type MeetingApiData = {
  id: number;

  projectId: number;

  projectName: string;

  customerName: string;

  title: string;

  description: string | null;

  status: MeetingStatus;

  method: MeetingMethod;

  scheduledAt: string;

  durationMinutes: number | null;

  location: string | null;

  result: string | null;

  nextAction: string | null;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;
};

/**
 * Meeting一覧APIの検索条件。
 *
 * Laravel側のIndexMeetingRequestと
 * 同じQuery Parameterを使用する。
 */
export type MeetingQuery = {
  projectId?: number;

  status?: MeetingStatus;

  method?: MeetingMethod;

  search?: string;

  perPage?: number;

  page?: number;
};

/**
 * Meeting検索条件を
 * URL Query Stringへ変換する。
 *
 * 例：
 *
 * {
 *   status: "scheduled",
 *   method: "online",
 *   projectId: 1
 * }
 *
 * ↓
 *
 * status=scheduled&method=online&projectId=1
 */
function buildMeetingQuery(
  query: MeetingQuery,
): string {
  const params =
    new URLSearchParams();

  if (
    query.projectId !== undefined
  ) {
    params.set(
      "projectId",
      String(
        query.projectId,
      ),
    );
  }

  if (
    query.status !== undefined
  ) {
    params.set(
      "status",
      query.status,
    );
  }

  if (
    query.method !== undefined
  ) {
    params.set(
      "method",
      query.method,
    );
  }

  if (
    query.search !== undefined &&
    query.search.trim() !== ""
  ) {
    params.set(
      "search",
      query.search.trim(),
    );
  }

  /**
   * Task一覧と同様、
   * Client側で検索・Filter・Paginationを
   * 行えるよう最大100件取得する。
   */
  params.set(
    "perPage",
    String(
      query.perPage ?? 100,
    ),
  );

  if (
    query.page !== undefined
  ) {
    params.set(
      "page",
      String(
        query.page,
      ),
    );
  }

  return params.toString();
}

/**
 * Laravel Meeting API Dataを、
 * Frontend UI用Meeting型へ変換する。
 *
 * API Data
 * ↓
 * mapMeeting()
 * ↓
 * UI Data
 *
 * という境界を設けることで、
 * 将来API Responseが変更された場合の
 * UIへの影響を限定する。
 */
export function mapMeeting(
  meeting: MeetingApiData,
): Meeting {
  return {
    id:
      meeting.id,

    projectId:
      meeting.projectId,

    projectName:
      meeting.projectName,

    customerName:
      meeting.customerName,

    title:
      meeting.title,

    description:
      meeting.description,

    status:
      meeting.status,

    method:
      meeting.method,

    scheduledAt:
      meeting.scheduledAt,

    durationMinutes:
      meeting.durationMinutes,

    location:
      meeting.location,

    result:
      meeting.result,

    nextAction:
      meeting.nextAction,

    completedAt:
      meeting.completedAt,

    createdAt:
      meeting.createdAt,

    updatedAt:
      meeting.updatedAt,
  };
}

/**
 * Meeting一覧取得。
 *
 * GET /api/v1/meetings
 *
 * Server Componentから呼び出す場合は、
 * getServerAuthRequestInit()で取得した
 * Authentication情報をinitへ渡す。
 */
export async function getMeetings(
  query: MeetingQuery = {},
  init: RequestInit = {},
): Promise<MeetingApiData[]> {
  const queryString =
    buildMeetingQuery(
      query,
    );

  const response =
    await apiRequest<
      ApiCollectionResponse<MeetingApiData>
    >(
      `/meetings?${queryString}`,
      init,
    );

  return response.data;
}

/**
 * Meeting詳細取得。
 *
 * GET /api/v1/meetings/{meeting}
 */
export async function getMeeting(
  id: number,
  init: RequestInit = {},
): Promise<MeetingApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<MeetingApiData>
    >(
      `/meetings/${id}`,
      init,
    );

  return response.data;
}

/**
 * HTML Form用MeetingFormDataを、
 * Laravel Meeting API用Payloadへ変換する。
 *
 * Form:
 *
 * projectId = string
 * durationMinutes = string
 *
 * ↓
 *
 * API:
 *
 * projectId = number
 * durationMinutes = number | null
 *
 * nullableのText Fieldは、
 * 空文字の場合nullへ変換する。
 *
 * completedAtはFrontendから送信せず、
 * Laravel側でstatusと同期する。
 */
function createMeetingPayload(
  formData: MeetingFormData,
) {
  return {
    projectId:
      Number(
        formData.projectId,
      ),

    title:
      formData.title.trim(),

    description:
      formData.description
        .trim() === ""
        ? null
        : formData.description.trim(),

    status:
      formData.status,

    method:
      formData.method,

    /**
     * datetime-localの値をそのまま送信する。
     *
     * 例：
     *
     * 2026-11-15T10:30
     *
     * Backend側のdate Validationで受け付ける。
     */
    scheduledAt:
      formData.scheduledAt,

    durationMinutes:
      formData.durationMinutes
        .trim() === ""
        ? null
        : Number(
            formData.durationMinutes,
          ),

    location:
      formData.location
        .trim() === ""
        ? null
        : formData.location.trim(),

    result:
      formData.result
        .trim() === ""
        ? null
        : formData.result.trim(),

    nextAction:
      formData.nextAction
        .trim() === ""
        ? null
        : formData.nextAction.trim(),
  };
}

/**
 * Meeting新規登録。
 *
 * POST /api/v1/meetings
 */
export async function createMeeting(
  formData: MeetingFormData,
): Promise<MeetingApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<MeetingApiData>
    >(
      "/meetings",
      {
        method: "POST",

        body: JSON.stringify(
          createMeetingPayload(
            formData,
          ),
        ),
      },
    );

  return response.data;
}

/**
 * Meeting更新。
 *
 * PATCH /api/v1/meetings/{meeting}
 *
 * 現在のFormでは編集内容一式を送信する。
 *
 * Backend側のUpdateMeetingRequestは
 * 部分更新にも対応しているため、
 * 将来的にStatusのみ更新することもできる。
 */
export async function updateMeeting(
  id: number,
  formData: MeetingFormData,
): Promise<MeetingApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<MeetingApiData>
    >(
      `/meetings/${id}`,
      {
        method: "PATCH",

        body: JSON.stringify(
          createMeetingPayload(
            formData,
          ),
        ),
      },
    );

  return response.data;
}

/**
 * Meeting削除。
 *
 * DELETE /api/v1/meetings/{meeting}
 *
 * Laravel側では削除成功時に
 * 204 No Contentを返す。
 */
export async function deleteMeeting(
  id: number,
): Promise<void> {
  await apiRequest<void>(
    `/meetings/${id}`,
    {
      method: "DELETE",
    },
  );
}
