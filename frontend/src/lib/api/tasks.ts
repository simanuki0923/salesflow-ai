import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiCollectionResponse,
  ApiResourceResponse,
} from "@/lib/api/types";

import type {
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

/**
 * Laravel TaskResourceが返すJSON。
 *
 * BackendではDBのsnake_caseを
 * TaskResourceによってcamelCaseへ
 * 変換して返している。
 */
export type TaskApiData = {
  id: number;

  projectId: number;

  projectName: string;

  customerName: string;

  title: string;

  description: string | null;

  status: TaskStatus;

  priority: TaskPriority;

  dueDate: string | null;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;
};

/**
 * Task一覧APIの検索条件。
 *
 * Laravel側のIndexTaskRequestと
 * 同じQuery Parameterを使用する。
 */
export type TaskQuery = {
  projectId?: number;

  status?: TaskStatus;

  priority?: TaskPriority;

  search?: string;

  perPage?: number;

  page?: number;
};

/**
 * Task検索条件を
 * URL Query Stringへ変換する。
 *
 * 例：
 *
 * {
 *   status: "in_progress",
 *   priority: "high",
 *   projectId: 1
 * }
 *
 * ↓
 *
 * status=in_progress&priority=high&projectId=1
 */
function buildTaskQuery(
  query: TaskQuery,
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
    query.priority !== undefined
  ) {
    params.set(
      "priority",
      query.priority,
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
   * 現在のFrontendでは、
   * Client側でも一覧FilterやPaginationを行うため、
   * Project一覧と同様に最大100件取得する。
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
 * Laravel Task API Dataを、
 * Frontend UI用Task型へ変換する。
 *
 * 現時点ではTaskResourceとTask型の構造は
 * ほぼ同じだが、
 *
 * API Data
 * ↓
 * mapTask()
 * ↓
 * UI Data
 *
 * という境界を設けておくことで、
 * 将来API Responseが変更された場合でも
 * UIへの影響を限定できる。
 */
export function mapTask(
  task: TaskApiData,
): Task {
  return {
    id:
      task.id,

    projectId:
      task.projectId,

    projectName:
      task.projectName,

    customerName:
      task.customerName,

    title:
      task.title,

    description:
      task.description,

    status:
      task.status,

    priority:
      task.priority,

    dueDate:
      task.dueDate,

    completedAt:
      task.completedAt,

    createdAt:
      task.createdAt,

    updatedAt:
      task.updatedAt,
  };
}

/**
 * Task一覧取得。
 *
 * GET /api/v1/tasks
 *
 * Server Componentから呼び出す場合は、
 * getServerAuthRequestInit()で取得した
 * Authentication情報をinitへ渡す。
 */
export async function getTasks(
  query: TaskQuery = {},
  init: RequestInit = {},
): Promise<TaskApiData[]> {
  const queryString =
    buildTaskQuery(
      query,
    );

  const response =
    await apiRequest<
      ApiCollectionResponse<TaskApiData>
    >(
      `/tasks?${queryString}`,
      init,
    );

  return response.data;
}

/**
 * Task詳細取得。
 *
 * GET /api/v1/tasks/{task}
 */
export async function getTask(
  id: number,
  init: RequestInit = {},
): Promise<TaskApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<TaskApiData>
    >(
      `/tasks/${id}`,
      init,
    );

  return response.data;
}

/**
 * HTML Form用TaskFormDataを、
 * Laravel Task API用Payloadへ変換する。
 *
 * Form:
 *
 * projectId = string
 * dueDate = "" または YYYY-MM-DD
 *
 * ↓
 *
 * API:
 *
 * projectId = number
 * dueDate = null または YYYY-MM-DD
 */
function createTaskPayload(
  formData: TaskFormData,
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

    priority:
      formData.priority,

    dueDate:
      formData.dueDate === ""
        ? null
        : formData.dueDate,
  };
}

/**
 * Task新規登録。
 *
 * POST /api/v1/tasks
 *
 * completedAtはFrontendから送信しない。
 *
 * statusがcompletedの場合は、
 * Laravel側でcompleted_atを自動設定する。
 */
export async function createTask(
  formData: TaskFormData,
): Promise<TaskApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<TaskApiData>
    >(
      "/tasks",
      {
        method: "POST",

        body: JSON.stringify(
          createTaskPayload(
            formData,
          ),
        ),
      },
    );

  return response.data;
}

/**
 * Task更新。
 *
 * PATCH /api/v1/tasks/{task}
 *
 * 現在のFormでは編集内容一式を送信する。
 *
 * Backend側のUpdateTaskRequestは
 * PATCHによる部分更新にも対応しているため、
 * 将来的にStatusだけを更新する機能なども
 * 追加できる。
 */
export async function updateTask(
  id: number,
  formData: TaskFormData,
): Promise<TaskApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<TaskApiData>
    >(
      `/tasks/${id}`,
      {
        method: "PATCH",

        body: JSON.stringify(
          createTaskPayload(
            formData,
          ),
        ),
      },
    );

  return response.data;
}

/**
 * Task削除。
 *
 * DELETE /api/v1/tasks/{task}
 *
 * Laravel側では削除成功時に
 * 204 No Contentを返す。
 */
export async function deleteTask(
  id: number,
): Promise<void> {
  await apiRequest<void>(
    `/tasks/${id}`,
    {
      method: "DELETE",
    },
  );
}