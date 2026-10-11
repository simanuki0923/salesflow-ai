import { notFound } from "next/navigation";

import CustomerForm
  from "@/components/customers/CustomerForm";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getCustomer,
} from "@/lib/api/customers";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  CustomerFormData,
} from "@/types/customer";

export const dynamic =
  "force-dynamic";

type CustomerEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Customer編集ページ。
 *
 * Laravel APIから現在のCustomer情報を取得し、
 * CustomerFormのinitialDataへ設定する。
 */
export default async function CustomerEditPage({
  params,
}: CustomerEditPageProps) {
  const { id } = await params;

  const customerId =
    Number(id);

  if (
    !Number.isInteger(
      customerId,
    ) ||
    customerId <= 0
  ) {
    notFound();
  }

  /**
   * BrowserからNext.jsへ届いた
   * Laravel Session Cookieを取得する。
   */
  const authInit =
    await getServerAuthRequestInit();

  let customer;

  try {
    customer =
      await getCustomer(
        customerId,
        authInit,
      );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  const initialData:
    CustomerFormData = {
    name:
      customer.name,

    nameKana:
      customer.nameKana ?? "",

    contactName:
      customer.contactName,

    contactNameKana:
      customer
        .contactNameKana ?? "",

    email:
      customer.email,

    phone:
      customer.phone ?? "",

    postalCode:
      customer.postalCode ?? "",

    address:
      customer.address ?? "",

    industry:
      customer.industry ?? "",

    website:
      customer.website ?? "",

    status:
      customer.status,

    memo:
      customer.memo ?? "",
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          顧客情報を編集
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          登録されている顧客情報を変更します。
        </p>
      </section>

      <CustomerForm
        mode="edit"
        customerId={customerId}
        initialData={initialData}
      />
    </div>
  );
}