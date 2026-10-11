import { apiRequest } from "@/lib/api/client";

import type {
  ApiCollectionResponse,
  ApiResourceResponse,
} from "@/lib/api/types";

import type {
  Customer,
  CustomerFormData,
} from "@/types/customer";

/**
 * Laravel CustomerResourceが返すJSON。
 *
 * DBではsnake_caseだが、
 * CustomerResourceによってcamelCaseへ
 * 変換された後の型を定義する。
 */
export type CustomerApiData = {
  id: number;

  name: string;
  nameKana: string | null;

  contactName: string;
  contactNameKana: string | null;

  email: string;
  phone: string | null;

  postalCode: string | null;
  address: string | null;

  industry: string | null;
  website: string | null;

  status: "active" | "inactive";

  lastContactDate: string | null;

  memo: string | null;

  projectCount: number;

  createdAt: string;
  updatedAt: string;
};

/**
 * API Customerを一覧画面用Customerへ変換する。
 *
 * UI側では空文字を扱いやすいため、
 * nullable値を必要に応じて空文字へ変換する。
 */
export function mapCustomer(
  customer: CustomerApiData,
): Customer {
  return {
    id: customer.id,

    name: customer.name,

    contactName:
      customer.contactName,

    email:
      customer.email,

    phone:
      customer.phone ?? "",

    projectCount:
      customer.projectCount,

    lastContactDate:
      customer.lastContactDate ?? "",

    status:
      customer.status,
  };
}

/**
 * Customer一覧取得。
 *
 * init:
 * Next.js Server Componentから呼び出す場合に、
 * Laravel Session Cookie等のAuthentication情報を
 * apiRequest()へ渡すため使用する。
 *
 * Browser側から呼ぶ場合は、
 * initを省略してそのまま利用できる。
 */
export async function getCustomers(
  perPage = 100,
  init: RequestInit = {},
): Promise<CustomerApiData[]> {
  const response =
    await apiRequest<
      ApiCollectionResponse<CustomerApiData>
    >(
      `/customers?perPage=${perPage}`,
      init,
    );

  return response.data;
}

/**
 * Customer詳細取得。
 *
 * init:
 * Next.js Server ComponentからLaravelへ
 * Session Cookieを転送するため使用する。
 *
 * これにより、
 *
 * Browser
 * ↓
 * Next.js Server Component
 * ↓
 * Laravel auth:sanctum
 *
 * の認証を維持したままCustomer詳細を取得できる。
 */
export async function getCustomer(
  id: number,
  init: RequestInit = {},
): Promise<CustomerApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<CustomerApiData>
    >(
      `/customers/${id}`,
      init,
    );

  return response.data;
}

/**
 * Customer登録。
 *
 * Browser側のFormから実行する。
 *
 * apiRequest()側で、
 *
 * credentials: "include"
 * X-XSRF-TOKEN
 *
 * を処理するため、
 * ここでは認証処理を重複して書かない。
 */
export async function createCustomer(
  formData: CustomerFormData,
): Promise<CustomerApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<CustomerApiData>
    >(
      "/customers",
      {
        method: "POST",

        body: JSON.stringify(
          formData,
        ),
      },
    );

  return response.data;
}

/**
 * Customer更新。
 *
 * 現在の編集Formでは全項目を送るが、
 * Laravel側はPATCHによる部分更新にも対応している。
 *
 * Browser側からのPATCH Requestについても、
 * apiRequest()がSession Cookieと
 * XSRF Tokenの送信を担当する。
 */
export async function updateCustomer(
  id: number,
  formData: CustomerFormData,
): Promise<CustomerApiData> {
  const response =
    await apiRequest<
      ApiResourceResponse<CustomerApiData>
    >(
      `/customers/${id}`,
      {
        method: "PATCH",

        body: JSON.stringify(
          formData,
        ),
      },
    );

  return response.data;
}