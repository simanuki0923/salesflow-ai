import type { Customer } from "@/types/customer";

/**
 * 顧客一覧画面のUI確認用Mockデータ。
 *
 * 現段階ではLaravel APIをまだ作成していないため、
 * TypeScriptファイル内に固定データを用意している。
 *
 * Laravel API実装後は、
 *
 * GET /api/v1/customers
 *
 * から取得したデータへ置き換える。
 */
export const customers: Customer[] = [
  {
    id: 1,
    name: "株式会社ABC",
    contactName: "山田 太郎",
    email: "yamada@example.com",
    phone: "03-1234-5678",
    projectCount: 3,
    lastContactDate: "2026/09/28",
    status: "active",
  },
  {
    id: 2,
    name: "株式会社サンプル",
    contactName: "佐藤 花子",
    email: "sato@example.com",
    phone: "03-9876-5432",
    projectCount: 2,
    lastContactDate: "2026/09/27",
    status: "active",
  },
  {
    id: 3,
    name: "合同会社テスト",
    contactName: "鈴木 一郎",
    email: "suzuki@example.com",
    phone: "045-123-4567",
    projectCount: 1,
    lastContactDate: "2026/09/25",
    status: "active",
  },
  {
    id: 4,
    name: "デザイン株式会社",
    contactName: "高橋 美咲",
    email: "takahashi@example.com",
    phone: "048-111-2222",
    projectCount: 4,
    lastContactDate: "2026/09/22",
    status: "active",
  },
  {
    id: 5,
    name: "システム開発株式会社",
    contactName: "田中 健",
    email: "tanaka@example.com",
    phone: "042-555-1234",
    projectCount: 5,
    lastContactDate: "2026/09/20",
    status: "active",
  },
  {
    id: 6,
    name: "株式会社グリーン",
    contactName: "伊藤 愛",
    email: "ito@example.com",
    phone: "03-2222-3333",
    projectCount: 1,
    lastContactDate: "2026/09/18",
    status: "inactive",
  },
  {
    id: 7,
    name: "株式会社ブルー",
    contactName: "渡辺 翔",
    email: "watanabe@example.com",
    phone: "03-4444-5555",
    projectCount: 2,
    lastContactDate: "2026/09/16",
    status: "active",
  },
  {
    id: 8,
    name: "株式会社オレンジ",
    contactName: "山本 彩",
    email: "yamamoto@example.com",
    phone: "03-6666-7777",
    projectCount: 1,
    lastContactDate: "2026/09/10",
    status: "inactive",
  },
];