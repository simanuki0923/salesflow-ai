import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ProjectForm from "@/components/projects/ProjectForm";

import { customers } from "@/lib/mock/customers";
import { findProjectDetailById } from "@/lib/mock/projectDetails";

import type {
  ProjectCustomerOption,
  ProjectFormData,
} from "@/types/project";

/**
 * Dynamic RouteのURLパラメータ。
 *
 * /projects/1/edit
 *
 * ↓
 *
 * id = "1"
 */
type ProjectEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 案件編集画面。
 *
 * 既存ProjectDetailを取得して、
 * ProjectFormDataへ変換する。
 *
 * ProjectFormをeditモードで再利用する。
 */
export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  /**
   * Dynamic Route Parameter取得。
   */
  const { id } = await params;

  /**
   * URL上のIDはstringなのでnumberへ変換。
   */
  const projectId = Number(id);

  /**
   * 正の整数ではない場合は404。
   */
  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    notFound();
  }

  /**
   * 現段階ではMockデータから
   * 案件詳細を取得する。
   */
  const project =
    findProjectDetailById(projectId);

  /**
   * 案件が存在しない場合は404。
   */
  if (!project) {
    notFound();
  }

  /**
   * ProjectFormに必要な
   * 顧客選択データを作成する。
   */
  const customerOptions: ProjectCustomerOption[] =
    customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
    }));

  /**
   * ProjectDetail
   *
   * ↓
   *
   * ProjectFormData
   *
   * へ変換する。
   *
   * amount / progress / customerIdは
   * Formではstringとして扱うためString()で変換する。
   *
   * notesはnullの場合があるため空文字へ変換する。
   */
  const initialData: ProjectFormData = {
    name: project.name,

    customerId: String(
      project.customerId,
    ),

    type: project.type,

    ownerName: project.ownerName,

    status: project.status,

    priority: project.priority,

    amount: String(project.amount),

   /**
     * MockデータではYYYY/MM/DD形式で保持しているが、
     * <input type="date"> のvalueには
     * YYYY-MM-DD形式が必要。
     *
     * そのため "/" を "-" へ変換して
     * Formへ渡す。
     */
    startDate:
      project.startDate.replaceAll(
        "/",
        "-",
      ),

    dueDate:
      project.dueDate.replaceAll(
        "/",
        "-",
      ),
    
    progress: String(
      project.progress,
    ),

    description:
      project.description,

    notes: project.notes ?? "",
  };

  return (
    <div className="space-y-6">
      {/* 案件詳細へ戻る */}
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />

        案件詳細へ戻る
      </Link>

      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          案件情報の編集
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {project.name}
          の登録情報を編集します。
        </p>
      </section>

      {/* 共通ProjectForm */}
      <ProjectForm
        mode="edit"
        projectId={project.id}
        customerOptions={
          customerOptions
        }
        initialData={initialData}
      />
    </div>
  );
}