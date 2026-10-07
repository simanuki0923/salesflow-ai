import { apiRequest } from "@/lib/api/client";

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
 * Laravel ProjectResource Response。
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
 * Project検索条件。
 */
export type ProjectQuery = {
  customerId?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  search?: string;
  perPage?: number;
};

/**
 * Query Objectから
 * URLSearchParamsを作成する。
 */
function buildProjectQuery(
  query: ProjectQuery,
): string {
  const params =
    new URLSearchParams();

  if (query.customerId !== undefined) {
    params.set(
      "customerId",
      String(query.customerId),
    );
  }

  if (query.status !== undefined) {
    params.set(
      "status",
      query.status,
    );
  }

  if (query.priority !== undefined) {
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
      query.search,
    );
  }

  params.set(
    "perPage",
    String(query.perPage ?? 100),
  );

  return params.toString();
}

/**
 * Project API Dataを
 * 一覧表示用Projectへ変換する。
 */
export function mapProject(
  project: ProjectApiData,
): Project {
  return {
    id: project.id,

    name: project.name,

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
  const search =
    buildProjectQuery(query);

  const response =
    await apiRequest<
      ApiCollectionResponse<ProjectApiData>
    >(`/projects?${search}`);

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
    >(`/projects/${id}`);

  return response.data;
}

/**
 * ProjectDetail UIへ変換する。
 *
 * Task / Activity / Milestoneは、
 * まだLaravel APIを実装していないため
 * 現段階では空配列とする。
 */
export function mapProjectDetail(
  project: ProjectApiData,
): ProjectDetail {
  return {
    ...mapProject(project),

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
 * ProjectFormDataから
 * Laravel API Payloadへ変換する。
 *
 * HTML Formでは数値もstringとして保持しているため、
 * API送信直前にnumberへ変換する。
 */
function createProjectPayload(
  formData: ProjectFormData,
) {
  return {
    name:
      formData.name,

    customerId:
      Number(formData.customerId),

    type:
      formData.type.trim() === ""
        ? null
        : formData.type,

    ownerName:
      formData.ownerName,

    status:
      formData.status,

    priority:
      formData.priority,

    amount:
      Number(formData.amount),

    startDate:
      formData.startDate,

    dueDate:
      formData.dueDate,

    progress:
      Number(formData.progress),

    description:
      formData.description.trim() === ""
        ? null
        : formData.description,

    notes:
      formData.notes.trim() === ""
        ? null
        : formData.notes,
  };
}

/**
 * Project登録。
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