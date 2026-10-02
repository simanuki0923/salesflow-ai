import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CustomerForm from "@/components/customers/CustomerForm";

/**
 * 顧客新規登録画面。
 *
 * CustomerFormをcreateモードで使用する。
 *
 * createモードでは初期データを渡さないため、
 * すべて空欄の状態から入力を開始する。
 */
export default function CustomerCreatePage() {
  return (
    <div className="space-y-6">

      {/* 顧客一覧へ戻る */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />

        顧客一覧へ戻る
      </Link>


      {/* ページタイトル */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          顧客の新規登録
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          新しい顧客情報を登録します。
        </p>
      </section>


      {/* 共通CustomerForm */}
      <CustomerForm mode="create" />

    </div>
  );
}