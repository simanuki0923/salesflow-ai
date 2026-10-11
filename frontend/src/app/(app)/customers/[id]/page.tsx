import { notFound } from "next/navigation";

import CustomerActivity
  from "@/components/customers/CustomerActivity";

import CustomerBasicInfo
  from "@/components/customers/CustomerBasicInfo";

import CustomerDetailHeader
  from "@/components/customers/CustomerDetailHeader";

import CustomerProjects
  from "@/components/customers/CustomerProjects";

import {
  ApiError,
} from "@/lib/api/client";

import {
  getCustomer,
  mapCustomer,
} from "@/lib/api/customers";

import {
  getProjects,
} from "@/lib/api/projects";

import {
  getServerAuthRequestInit,
} from "@/lib/api/server-auth";

import type {
  CustomerDetail,
} from "@/types/customer";

export const dynamic =
  "force-dynamic";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Customer詳細画面用データを取得する。
 *
 * RequestInitには、
 * Next.js Serverへ届いたLaravel Session Cookieが
 * 含まれている。
 */
async function fetchCustomerDetail(
  customerId: number,
  authInit: RequestInit,
): Promise<CustomerDetail> {
  try {
    /**
     * Customer本体とProject一覧は
     * 独立しているため並列取得する。
     */
    const [
      apiCustomer,
      apiProjects,
    ] = await Promise.all([
      getCustomer(
        customerId,
        authInit,
      ),

      getProjects(
        {
          customerId,
          perPage: 100,
        },
        authInit,
      ),
    ]);

    return {
      ...mapCustomer(
        apiCustomer,
      ),

      nameKana:
        apiCustomer.nameKana ?? "",

      contactNameKana:
        apiCustomer
          .contactNameKana ?? "",

      postalCode:
        apiCustomer
          .postalCode ?? "",

      address:
        apiCustomer.address ?? "",

      industry:
        apiCustomer.industry ?? "",

      website:
        apiCustomer.website,

      memo:
        apiCustomer.memo,

      /**
       * Tag APIは未実装。
       */
      tags: [],

      projects:
        apiProjects.map(
          (project) => ({
            id:
              project.id,

            name:
              project.name,

            status:
              project.status,

            amount:
              project.amount,

            dueDate:
              project.dueDate,
          }),
        ),

      /**
       * Activity APIは未実装。
       */
      activities: [],
    };
  } catch (error) {
    /**
     * 存在しないCustomer、
     * または他User所有Customerは
     * Laravelから404になる。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
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
   * Server ComponentからLaravelへ
   * Session Cookieを転送する。
   */
  const authInit =
    await getServerAuthRequestInit();

  const customer =
    await fetchCustomerDetail(
      customerId,
      authInit,
    );

  /**
   * JSXはtry/catchの外で生成する。
   */
  return (
    <div className="space-y-6">
      <CustomerDetailHeader
        customer={customer}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <CustomerBasicInfo
          customer={customer}
        />

        <CustomerProjects
          projects={
            customer.projects
          }
        />
      </div>

      <CustomerActivity
        activities={
          customer.activities
        }
      />
    </div>
  );
}