import { notFound } from "next/navigation";

import CustomerActivity from "@/components/customers/CustomerActivity";
import CustomerBasicInfo from "@/components/customers/CustomerBasicInfo";
import CustomerDetailHeader from "@/components/customers/CustomerDetailHeader";
import CustomerProjects from "@/components/customers/CustomerProjects";
import { findCustomerDetailById } from "@/lib/mock/customerDetails";

/**
 * Dynamic Routeで受け取るURLパラメータ。
 *
 * /customers/1
 *
 * の場合、
 *
 * id = "1"
 *
 * が渡される。
 *
 * Next.js 16ではparamsはPromiseとして扱う。
 */
type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * SalesFlow AI 顧客詳細画面。
 *
 * URLの顧客IDを取得し、
 * 該当顧客の詳細情報を表示する。
 *
 * 現在：
 *
 * Mockデータ
 *
 * ↓
 *
 * 将来：
 *
 * Laravel
 * GET /api/v1/customers/{id}
 *
 * へ変更する予定。
 */
export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  /**
   * Next.js 16ではparamsがPromiseなので、
   * awaitしてURLパラメータを取得する。
   */
  const { id } = await params;

  /**
   * URLから取得したidはstringなのでnumberへ変換する。
   */
  const customerId = Number(id);

  /**
   * IDが数値でない場合は404画面を表示する。
   *
   * 例：
   *
   * /customers/abc
   */
  if (Number.isNaN(customerId)) {
    notFound();
  }

  /**
   * Mockデータから対象顧客を取得する。
   */
  const customer =
    findCustomerDetailById(customerId);

  /**
   * 顧客が存在しなければ404。
   *
   * Laravel API接続後は404レスポンスを
   * この処理へ対応させる。
   */
  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">

      {/* 顧客名・取引状態・編集ボタン */}
      <CustomerDetailHeader customer={customer} />

      {/*
       * 詳細情報エリア。
       *
       * PCでは左側をやや広くして2カラム表示。
       * モバイルでは1カラム表示。
       */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">

        {/* 左側 */}
        <div className="space-y-6">

          {/* 顧客基本情報 */}
          <CustomerBasicInfo customer={customer} />

          {/* 関連案件 */}
          <CustomerProjects
            projects={customer.projects}
          />

        </div>

        {/* 右側 */}
        <div>

          {/* 商談・電話・メールなどの活動履歴 */}
          <CustomerActivity
            activities={customer.activities}
          />

        </div>
      </section>
    </div>
  );
}