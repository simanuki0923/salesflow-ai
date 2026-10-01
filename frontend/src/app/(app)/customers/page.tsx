import Link from "next/link";
import { Plus } from "lucide-react";

import CustomerListClient from "@/components/customers/CustomerListClient";
import { customers } from "@/lib/mock/customers";

/**
 * SalesFlow AI 顧客管理一覧ページ。
 *
 * このページ自体はServer Componentとして実装する。
 *
 * 検索・フィルターなどブラウザ側の操作が必要な部分だけを
 * CustomerListClientへ分離している。
 *
 * 将来的には、
 *
 * Laravel API
 * GET /api/v1/customers
 *
 * から取得した顧客データを
 * CustomerListClientへ渡す構成に変更する。
 */
export default function CustomersPage() {
  return (
    <div className="space-y-6">

      {/* =====================================================
       * ページ上部
       * ===================================================== */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* ページタイトル */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            顧客管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            顧客情報や関連案件を管理します。
          </p>
        </div>

        {/*
         * 顧客新規登録画面へ遷移する。
         *
         * Next.jsのLinkを使用することで、
         * 通常の<a>タグより効率よくページ遷移できる。
         */}
        <Link
          href="/customers/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />

          新規顧客登録
        </Link>
      </section>


      {/* =====================================================
       * 顧客一覧
       *
       * 現段階ではMockデータを渡している。
       * ===================================================== */}
      <CustomerListClient customers={customers} />

    </div>
  );
}