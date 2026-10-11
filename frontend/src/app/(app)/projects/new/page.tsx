import ProjectForm
  from "@/components/projects/ProjectForm";

import {
  getCustomers,
} from "@/lib/api/customers";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  ProjectCustomerOption,
} from "@/types/project";

/**
 * Customer一覧もDBから取得するため、
 * Dynamic Renderingとする。
 */
export const dynamic =
  "force-dynamic";

/**
 * Project新規登録ページ。
 *
 * Projectに紐づけるCustomerも
 * Laravel Customer APIから取得する。
 */
export default async function ProjectCreatePage() {
  /**
   * Laravel Session Cookieを
   * Customer APIへ渡す。
   *
   * Laravel側でLogin User所有Customerだけが
   * 返される。
   */
  const authInit =
    await getServerAuthRequestInit();

  const customers =
    await getCustomers(
      100,
      authInit,
    );

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

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          新規案件登録
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          新しい案件情報を登録します。
        </p>
      </section>

      <ProjectForm
        mode="create"
        customerOptions={
          customerOptions
        }
      />
    </div>
  );
}