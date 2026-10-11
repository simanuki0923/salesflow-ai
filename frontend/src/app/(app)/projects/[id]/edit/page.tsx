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

import type {
  ProjectCustomerOption,
  ProjectFormData,
} from "@/types/project";

/**
 * 編集画面では、
 * PostgreSQLの最新Project / Customerを取得する。
 */
export const dynamic = "force-dynamic";

/**
 * Dynamic Route Props。
 */
type ProjectEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Project編集ページ。
 *
 * Project：
 * GET /api/v1/projects/{id}
 *
 * Customer一覧：
 * GET /api/v1/customers
 *
 * を取得し、
 * ProjectFormへ編集初期値として渡す。
 */
export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const { id } = await params;

  const projectId =
    Number(id);

  /**
   * 不正なIDはAPIへ送らず404にする。
   */
  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    notFound();
  }

  /**
   * APIから取得したデータを、
   * try/catch外でも利用するため
   * 先に変数だけ宣言する。
   */
  let project;
  let customers;

  try {
    /**
     * ProjectとCustomer一覧には
     * データ依存関係がない。
     *
     * そのためPromise.all()で
     * 同時に取得して待ち時間を短縮する。
     */
    [
      project,
      customers,
    ] = await Promise.all([
      getProject(projectId),

      getCustomers(100),
    ]);
  } catch (error) {
    /**
     * Projectが存在しない場合。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    /**
     * Laravel停止など、
     * その他のErrorは上位へ渡す。
     */
    throw error;
  }

  /**
   * ここから下はtry/catch外。
   *
   * React JSXをtry/catch内へ置かないことで、
   * react-hooks/error-boundariesの
   * ESLint Errorを回避する。
   */

  /**
   * Customer API Dataを、
   * ProjectFormのSelect用データへ変換する。
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

  /**
   * Laravel APIとHTML Formでは
   * 一部の値の型が違う。
   *
   * API：
   * customerId number
   * amount number
   * progress number
   *
   * Form：
   * customerId string
   * amount string
   * progress string
   *
   * そのためFormへ渡す段階でstring化する。
   */
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

    /**
     * Laravel ProjectResourceは
     * YYYY-MM-DD形式で返す。
     *
     * そのためinput type="date"へ
     * そのまま渡せる。
     */
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

  /**
   * JSXはtry/catchの外でReturnする。
   */
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