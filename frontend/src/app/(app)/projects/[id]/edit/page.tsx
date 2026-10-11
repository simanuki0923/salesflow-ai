import { notFound } from "next/navigation";

import ProjectForm
  from "@/components/projects/ProjectForm";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getCustomers,
} from "@/lib/api/customers";

import {
  getProject,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  ProjectCustomerOption,
  ProjectFormData,
} from "@/types/project";

export const dynamic =
  "force-dynamic";

type ProjectEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Project編集ページ。
 */
export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const { id } = await params;

  const projectId =
    Number(id);

  if (
    !Number.isInteger(
      projectId,
    ) ||
    projectId <= 0
  ) {
    notFound();
  }

  /**
   * Laravel Session Cookieを、
   *
   * Project API
   * Customer API
   *
   * の両方へ渡す。
   */
  const authInit =
    await getServerAuthRequestInit();

  /**
   * API取得結果をtry/catch外でも使うため、
   * 先に変数を宣言する。
   */
  let project;
  let customers;

  try {
    /**
     * ProjectとCustomer一覧は
     * 相互依存しないため並列取得する。
     */
    [
      project,
      customers,
    ] = await Promise.all([
      getProject(
        projectId,
        authInit,
      ),

      getCustomers(
        100,
        authInit,
      ),
    ]);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  /**
   * JSXはtry/catch外で生成する。
   */

  const customerOptions:
    ProjectCustomerOption[] =
    customers.map(
      (customer) => ({
        id:
          customer.id,

        name:
          customer.name,
      }),
    );

  const initialData:
    ProjectFormData = {
    name:
      project.name,

    customerId:
      String(
        project.customerId,
      ),

    type:
      project.type ?? "",

    ownerName:
      project.ownerName,

    status:
      project.status,

    priority:
      project.priority,

    amount:
      String(
        project.amount,
      ),

    startDate:
      project.startDate,

    dueDate:
      project.dueDate,

    progress:
      String(
        project.progress,
      ),

    description:
      project.description ?? "",

    notes:
      project.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          案件情報を編集
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          登録されている案件情報を変更します。
        </p>
      </section>

      <ProjectForm
        mode="edit"
        projectId={projectId}
        customerOptions={
          customerOptions
        }
        initialData={
          initialData
        }
      />
    </div>
  );
}