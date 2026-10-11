import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiCollectionResponse,
  ApiResourceResponse,
} from "@/lib/api/types";

import type {
  Project,
  ProjectDetail,
  ProjectFormData,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

/**
 * Laravel ProjectResourceが返すJSON。
 *
 * PostgreSQLではsnake_caseだが、
 * ProjectResourceでcamelCaseへ変換済み。
 */
export type ProjectApiData = {
  id: number;

  name: string;

  customerId: number;

  customerName: string;

  type: string | null;

  ownerName: string;

  status: ProjectStatus;

  priority: ProjectPriority;

  amount: number;

  startDate: string;

  dueDate: string;

  progress: number;

  description: string | null;

  notes: string | null;

  createdAt: string;

  updatedAt: string;
};

/**
 * Project一覧取得条件。
 */
export type ProjectQuery = {
  customerId?: number;

  status?: ProjectStatus;

  priority?: ProjectPriority;

  search?: string;

  perPage?: number;

  page?: number;
};

/**
 * Project検索条件をQuery Stringへ変換する。
 */
function buildProjectQuery(
  query: ProjectQuery,
): string {
  const params =
    new URLSearchParams();

  if (
    query.customerId !== undefined
  ) {
    params.set(
      "customerId",
      String(query.customerId),
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

  params.set(
    "perPage",
    String(query.perPage ?? 100),
  );

  if (
    query.page !== undefined
  ) {
    params.set(
      "page",
      String(query.page),
    );
  }

  return params.toString();
}

/**
 * Laravel Project API Dataを、
 * 既存Project一覧UI用型へ変換する。
 */
export function mapProject(
  project: ProjectApiData,
): Project {
  return {
    id:
      project.id,

    name:
      project.name,

    customerId:
      project.customerId,

    customerName:
      project.customerName,

    status:
      project.status,

    priority:
      project.priority,

    amount:
      project.amount,

    startDate:
      project.startDate,

    dueDate:
      project.dueDate,

    progress:
      project.progress,
  };
}

/**
 * Project一覧取得。
 */
export async function getProjects(
  query: ProjectQuery = {},
): Promise<ProjectApiData[]> {
  const queryString =
    buildProjectQuery(query);

  const response =
    await apiRequest<
      ApiCollectionResponse<ProjectApiData>
    >(
      `/projects?${queryString}`,
    );

  return response.data;
}

/**
 * Project詳細取得。
 */
export async function getProject(
  id: number,
): Promise<ProjectApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<ProjectApiData>
    >(
      `/projects/${id}`,
    );

  return response.data;
}

/**
 * Laravel APIのProjectを、
 * Project詳細画面用型へ変換する。
 *
 * Task / Activity / Milestoneは
 * まだAPI未実装のため空配列とする。
 */
export function mapProjectDetail(
  project: ProjectApiData,
): ProjectDetail {
  return {
    ...mapProject(
      project,
    ),

    type:
      project.type ?? "",

    ownerName:
      project.ownerName,

    description:
      project.description ?? "",

    notes:
      project.notes,

    tasks: [],

    activities: [],

    milestones: [],
  };
}

/**
 * HTML Form用ProjectFormDataを、
 * Laravel APIが期待するPayloadへ変換する。
 *
 * Formではstringで管理している、
 *
 * customerId
 * amount
 * progress
 *
 * をここでnumberへ変換する。
 */
function createProjectPayload(
  formData: ProjectFormData,
) {
  return {
    name:
      formData.name.trim(),

    customerId:
      Number(
        formData.customerId,
      ),

    type:
      formData.type.trim() === ""
        ? null
        : formData.type.trim(),

    ownerName:
      formData.ownerName.trim(),

    status:
      formData.status,

    priority:
      formData.priority,

    amount:
      Number(
        formData.amount,
      ),

    startDate:
      formData.startDate,

    dueDate:
      formData.dueDate,

    progress:
      Number(
        formData.progress,
      ),

    description:
      formData.description.trim() === ""
        ? null
        : formData.description.trim(),

    notes:
      formData.notes.trim() === ""
        ? null
        : formData.notes.trim(),
  };
}

/**
 * Project新規登録。
 *
 * POST /api/v1/projects
 */
export async function createProject(
  formData: ProjectFormData,
): Promise<ProjectApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<ProjectApiData>
    >(
      "/projects",
      {
        method: "POST",

        body: JSON.stringify(
          createProjectPayload(
            formData,
          ),
        ),
      },
    );

  return response.data;
}

/**
 * Project更新。
 *
 * PATCH /api/v1/projects/{id}
 */
export async function updateProject(
  id: number,
  formData: ProjectFormData,
): Promise<ProjectApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<ProjectApiData>
    >(
      `/projects/${id}`,
      {
        method: "PATCH",

        body: JSON.stringify(
          createProjectPayload(
            formData,
          ),
        ),
      },
    );

  return response.data;
}