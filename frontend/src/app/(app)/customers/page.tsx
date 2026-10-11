import Link from "next/link";
import { Plus } from "lucide-react";

import CustomerListClient from "@/components/customers/CustomerListClient";

import {
  getCustomers,
  mapCustomer,
} from "@/lib/api/customers";

/**
 * Customer一覧はPostgreSQLの最新データを表示したい。
 *
 * force-dynamicを指定することで、
 * Build時に固定されたStatic HTMLを使うのではなく、
 * Request時にLaravel APIから最新データを取得する。
 */
export const dynamic = "force-dynamic";

/**
 * Customer一覧ページ。
 *
 * データの流れ：
 *
 * PostgreSQL
 *     ↓
 * Laravel
 * GET /api/v1/customers
 *     ↓
 * getCustomers()
 *     ↓
 * mapCustomer()
 *     ↓
 * CustomerListClient
 */
export default async function CustomersPage() {
  /**
   * Laravel APIからCustomer一覧を取得する。
   *
   * この時点ではLaravel Resource形式の
   * CustomerApiData[] が返ってくる。
   */
  const apiCustomers =
    await getCustomers(100);

  /**
   * Laravel API用の型から、
   * 既存CustomerListClientが使用している
   * Customer型へ変換する。
   */
  const customers =
    apiCustomers.map(mapCustomer);

  return (
    <div className="space-y-6">
      {/* ページタイトルと新規登録ボタン */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            顧客管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            顧客情報と取引状況を管理します。
          </p>
        </div>

        <Link
          href="/customers/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          新規顧客登録
        </Link>
      </section>

      {/*
       * 検索・Status Filter・Paginationなどの
       * UI操作はClient Component側へ任せる。
       *
       * データ取得はServer Component、
       * UI操作はClient Component、
       * という責務分離。
       */}
      <CustomerListClient
        customers={customers}
      />
    </div>
  );
}