import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CustomerForm from "@/components/customers/CustomerForm";
import { findCustomerDetailById } from "@/lib/mock/customerDetails";

import type { CustomerFormData } from "@/types/customer";

/**
 * Dynamic Routeのparams。
 *
 * /customers/1/edit
 *
 * の場合、
 *
 * id = "1"
 *
 * が渡される。
 */
type CustomerEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 顧客編集画面。
 *
 * 既存顧客データを取得し、
 * CustomerFormへinitialDataとして渡す。
 */
export default async function CustomerEditPage({
  params,
}: CustomerEditPageProps) {
  /**
   * URLパラメータ取得。
   */
  const { id } = await params;

  /**
   * stringからnumberへ変換。
   */
  const customerId = Number(id);

  /**
   * 数値として不正なIDは404。
   */
  if (Number.isNaN(customerId)) {
    notFound();
  }

  /**
   * 現段階ではMockデータから顧客を取得する。
   *
   * Laravel API完成後は、
   *
   * GET /api/v1/customers/{id}
   *
   * へ置き換える。
   */
  const customer =
    findCustomerDetailById(customerId);

  /**
   * 顧客が存在しない場合は404。
   */
  if (!customer) {
    notFound();
  }

  /**
   * CustomerDetailから
   * CustomerFormDataへ変換する。
   *
   * CustomerDetailではwebsite/memoがnullの可能性があるが、
   * HTMLフォームでは空文字として扱う。
   */
  const initialData: CustomerFormData = {
    name: customer.name,
    nameKana: customer.nameKana,

    contactName: customer.contactName,
    contactNameKana:
      customer.contactNameKana,

    email: customer.email,
    phone: customer.phone,

    postalCode: customer.postalCode,
    address: customer.address,

    industry: customer.industry,

    website: customer.website ?? "",

    status: customer.status,

    memo: customer.memo ?? "",
  };

  return (
    <div className="space-y-6">

      {/* 顧客詳細へ戻る */}
      <Link
        href={`/customers/${customer.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />

        顧客詳細へ戻る
      </Link>


      {/* ページタイトル */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          顧客情報の編集
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {customer.name}
          の登録情報を編集します。
        </p>
      </section>


      {/* 共通CustomerForm */}
      <CustomerForm
        mode="edit"
        customerId={customer.id}
        initialData={initialData}
      />

    </div>
  );
}