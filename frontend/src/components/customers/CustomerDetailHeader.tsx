import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Pencil,
} from "lucide-react";

import type { CustomerDetail } from "@/types/customer";

/**
 * 顧客詳細ヘッダーへ渡すProps。
 */
type CustomerDetailHeaderProps = {
  customer: CustomerDetail;
};

/**
 * 顧客詳細画面上部。
 *
 * ・顧客一覧へ戻る
 * ・会社名
 * ・担当者名
 * ・取引状態
 * ・編集画面へのリンク
 *
 * を表示する。
 */
export default function CustomerDetailHeader({
  customer,
}: CustomerDetailHeaderProps) {
  return (
    <section className="space-y-5">

      {/* 顧客一覧へ戻る */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />

        顧客一覧へ戻る
      </Link>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* 顧客情報 */}
        <div className="flex items-start gap-4">

          {/* 会社アイコン */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Building2 size={27} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>

              {/* 取引状態 */}
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",

                  customer.status === "active"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {customer.status === "active"
                  ? "取引中"
                  : "取引停止"}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              担当者：{customer.contactName}
            </p>
          </div>
        </div>

        {/* 編集画面 */}
        <Link
          href={`/customers/${customer.id}/edit`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Pencil size={17} />

          顧客情報を編集
        </Link>
      </div>
    </section>
  );
}