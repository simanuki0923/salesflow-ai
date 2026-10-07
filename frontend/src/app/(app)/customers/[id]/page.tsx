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

import type {
  CustomerDetail,
} from "@/types/customer";

/**
 * Customer詳細画面では、
 * PostgreSQLの最新データを毎回Laravel APIから取得する。
 *
 * そのためStatic生成ではなく、
 * RequestごとにServer Componentを実行する。
 */
export const dynamic =
  "force-dynamic";

/**
 * Next.js 16 App Routerでは、
 * Dynamic RouteのparamsをPromiseとして受け取る。
 *
 * URL:
 *
 * /customers/10
 *
 * の場合、
 *
 * params.id === "10"
 *
 * となる。
 */
type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Customer詳細画面用データを取得する。
 *
 * JSXの生成とAPI Error処理を分離するため、
 * API通信を専用関数へ切り出している。
 *
 * これにより、
 *
 * try/catch
 *     ↓
 * API取得だけ
 *
 * JSX
 *     ↓
 * Page Component側
 *
 * という責務分離ができる。
 */
async function fetchCustomerDetail(
  customerId: number,
): Promise<CustomerDetail> {
  try {
    /**
     * Customer本体と、
     * そのCustomerに紐づくProject一覧は
     * お互いの取得完了を待つ必要がない。
     *
     * そのためPromise.all()を使い、
     * 2つのAPIを並列実行する。
     *
     * GET /api/v1/customers/{id}
     *
     * GET /api/v1/projects?customerId={id}
     */
    const [
      apiCustomer,
      apiProjects,
    ] = await Promise.all([
      getCustomer(
        customerId,
      ),

      getProjects({
        customerId,
        perPage: 100,
      }),
    ]);

    /**
     * Laravel APIのCustomerデータを、
     * 既存UI Componentが利用している
     * CustomerDetail型へ変換する。
     */
    return {
      /**
       * 一覧画面でも利用する基本Customer情報。
       *
       * id
       * name
       * contactName
       * email
       * phone
       * projectCount
       * lastContactDate
       * status
       */
      ...mapCustomer(
        apiCustomer,
      ),

      /**
       * APIではnullの可能性があるが、
       * UIでは文字列として扱いやすくするため
       * nullを空文字へ変換する。
       */
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

      /**
       * websiteとmemoについては、
       * CustomerDetail型が
       *
       * string | null
       *
       * を許可しているため、
       * APIの値をそのまま利用できる。
       */
      website:
        apiCustomer.website,

      memo:
        apiCustomer.memo,

      /**
       * Tag Domain / APIはまだ未実装。
       *
       * 将来Tag APIを作成した段階で、
       * Laravelから取得した値へ置き換える。
       */
      tags: [],

      /**
       * Customerに紐づくProjectは、
       *
       * GET /api/v1/projects?customerId={id}
       *
       * から取得した実データを利用する。
       *
       * Customer詳細画面ではProject全項目は
       * 必要ないため、必要な情報だけへ変換する。
       */
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
       * Customer Activity Domain / APIも
       * 現段階では未実装。
       */
      activities: [],
    };
  } catch (error) {
    /**
     * Laravel APIから404が返った場合。
     *
     * Customerが存在しないので、
     * Next.js標準404画面へ遷移させる。
     */
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      notFound();
    }

    /**
     * Laravel停止・ネットワークError・500などは
     * ここで握りつぶさない。
     *
     * Next.js側のError Boundaryへ渡す。
     */
    throw error;
  }
}

/**
 * Customer詳細ページ。
 */
export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  /**
   * Dynamic Route Parameterを取得する。
   */
  const { id } = await params;

  /**
   * URL Parameterは文字列なので、
   * DB IDとして扱えるnumberへ変換する。
   */
  const customerId =
    Number(id);

  /**
   * 以下のような不正URLは、
   * Laravel APIへRequestする前に
   * Next.js側で404とする。
   *
   * /customers/abc
   * /customers/0
   * /customers/-1
   */
  if (
    !Number.isInteger(
      customerId,
    ) ||
    customerId <= 0
  ) {
    notFound();
  }

  /**
   * API通信・Error処理は
   * fetchCustomerDetail()へ任せる。
   *
   * ここでは正常に取得できたCustomerだけを受け取る。
   */
  const customer =
    await fetchCustomerDetail(
      customerId,
    );

  /**
   * JSXはtry/catchの外で構築する。
   *
   * ReactではJSXを作った時点で
   * Child Componentが即座にRenderされるわけではない。
   *
   * そのためJSXをtry/catch内に置いても、
   * Child Component内のRender Errorを
   * catchすることはできない。
   *
   * React / ESLintもその誤解を防ぐため、
   * try/catch内でのJSX生成を警告している。
   */
  return (
    <div className="space-y-6">
      {/*
       * Customer名・Status・編集ボタン等。
       */}
      <CustomerDetailHeader
        customer={customer}
      />

      {/*
       * 左：
       * Customer基本情報
       *
       * 右：
       * Customerに紐づくProject
       */}
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

      {/*
       * Activity APIは未実装なので、
       * 現在は空配列が渡される。
       */}
      <CustomerActivity
        activities={
          customer.activities
        }
      />
    </div>
  );
}