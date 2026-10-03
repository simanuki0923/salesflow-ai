import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ProjectForm from "@/components/projects/ProjectForm";
import { customers } from "@/lib/mock/customers";

import type { ProjectCustomerOption } from "@/types/project";

/**
 * 案件新規登録ページ。
 *
 * CustomerFormと同様に、
 * 共通ProjectFormをcreateモードで使用する。
 */
export default function ProjectCreatePage() {
  /**
   * Customer型全体ではなく、
   * ProjectFormに必要なid/nameだけへ変換する。
   */
  const customerOptions: ProjectCustomerOption[] =
    customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
    }));

  return (
    <div className="space-y-6">
      {/* 案件一覧へ戻る */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />

        案件一覧へ戻る
      </Link>

      {/* Page Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          案件の新規登録
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          新しい案件情報を登録します。
        </p>
      </section>

      {/* 共通案件Form */}
      <ProjectForm
        mode="create"
        customerOptions={
          customerOptions
        }
      />
    </div>
  );
}