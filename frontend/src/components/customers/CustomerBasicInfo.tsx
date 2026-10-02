import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import type { CustomerDetail } from "@/types/customer";

/**
 * 顧客基本情報へ渡すProps。
 */
type CustomerBasicInfoProps = {
  customer: CustomerDetail;
};

/**
 * 顧客の基本情報を表示するカード。
 */
export default function CustomerBasicInfo({
  customer,
}: CustomerBasicInfoProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold text-slate-900">
        基本情報
      </h2>

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        {/* 担当者 */}
        <InfoItem
          icon={User}
          label="担当者"
          value={customer.contactName}
        />

        {/* 業種 */}
        <InfoItem
          icon={Building2}
          label="業種"
          value={customer.industry}
        />

        {/* メール */}
        <InfoItem
          icon={Mail}
          label="メールアドレス"
          value={customer.email}
        />

        {/* 電話 */}
        <InfoItem
          icon={Phone}
          label="電話番号"
          value={customer.phone}
        />

        {/* 住所 */}
        <InfoItem
          icon={MapPin}
          label="住所"
          value={`〒${customer.postalCode} ${customer.address}`}
        />

        {/* Webサイト */}
        <InfoItem
          icon={Globe}
          label="Webサイト"
          value={customer.website ?? "未登録"}
        />

      </div>

      {/* タグ */}
      <div className="mt-7 border-t border-slate-100 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          タグ
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {customer.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* メモ */}
      <div className="mt-6 border-t border-slate-100 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          メモ
        </p>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {customer.memo ?? "メモは登録されていません。"}
        </p>
      </div>
    </div>
  );
}


/**
 * lucide-reactのアイコンコンポーネントを受け取る型。
 *
 * React.ComponentTypeを利用し、
 * sizeとclassNameを受け取れるコンポーネントを指定する。
 */
type InfoItemProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;

  label: string;
  value: string;
};

/**
 * 基本情報内で繰り返し使用する1項目。
 *
 * 担当者・電話番号・メールなどで
 * 同じUIを再利用する。
 */
function InfoItem({
  icon: Icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}