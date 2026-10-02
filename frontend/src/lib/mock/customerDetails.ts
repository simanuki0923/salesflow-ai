import type { CustomerDetail } from "@/types/customer";

/**
 * 顧客詳細画面のUI確認用Mockデータ。
 *
 * 現段階ではLaravel API未実装のため、
 * TypeScriptファイル内に固定データを保持する。
 *
 * 将来的には、
 *
 * GET /api/v1/customers/{id}
 *
 * のレスポンスへ置き換える。
 */
export const customerDetails: CustomerDetail[] = [
  {
    id: 1,

    name: "株式会社ABC",
    nameKana: "カブシキガイシャエービーシー",

    contactName: "山田 太郎",
    contactNameKana: "ヤマダ タロウ",

    email: "yamada@example.com",
    phone: "03-1234-5678",

    postalCode: "100-0001",
    address: "東京都千代田区千代田1-1",

    industry: "Web・IT",
    website: "https://example.com",

    projectCount: 3,
    lastContactDate: "2026/09/28",

    status: "active",

    memo:
      "Webサイト制作・システム開発を中心に継続的な相談あり。次回提案時にはAI活用についても紹介予定。",

    tags: [
      {
        id: 1,
        name: "重要顧客",
      },
      {
        id: 2,
        name: "継続取引",
      },
      {
        id: 3,
        name: "Web制作",
      },
    ],

    projects: [
      {
        id: 1,
        name: "コーポレートサイトリニューアル",
        status: "in_progress",
        amount: 550000,
        dueDate: "2026/11/30",
      },
      {
        id: 2,
        name: "採用サイト制作",
        status: "proposal",
        amount: 320000,
        dueDate: "2026/12/20",
      },
      {
        id: 3,
        name: "LP制作",
        status: "completed",
        amount: 180000,
        dueDate: "2026/08/31",
      },
    ],

    activities: [
      {
        id: 1,
        type: "meeting",
        title: "Webサイトリニューアル打ち合わせ",
        description:
          "トップページ構成とスマートフォン表示について要望を確認。",
        date: "2026/09/28",
      },
      {
        id: 2,
        type: "email",
        title: "見積書送付",
        description:
          "リニューアル案件の見積書をメールで送付。",
        date: "2026/09/25",
      },
      {
        id: 3,
        type: "call",
        title: "進捗確認",
        description:
          "担当者へ電話し、次回打ち合わせ日程を調整。",
        date: "2026/09/20",
      },
    ],
  },

  /**
   * 顧客一覧からid=2へ遷移した場合にも
   * 詳細ページを確認できるようサンプルを用意する。
   */
  {
    id: 2,

    name: "株式会社サンプル",
    nameKana: "カブシキガイシャサンプル",

    contactName: "佐藤 花子",
    contactNameKana: "サトウ ハナコ",

    email: "sato@example.com",
    phone: "03-9876-5432",

    postalCode: "160-0022",
    address: "東京都新宿区新宿1-1-1",

    industry: "小売",
    website: null,

    projectCount: 2,
    lastContactDate: "2026/09/27",

    status: "active",

    memo: "ECサイト関連の相談を継続中。",

    tags: [
      {
        id: 1,
        name: "EC",
      },
      {
        id: 2,
        name: "継続取引",
      },
    ],

    projects: [
      {
        id: 4,
        name: "ECサイト改善",
        status: "in_progress",
        amount: 420000,
        dueDate: "2026/12/10",
      },
      {
        id: 5,
        name: "キャンペーンLP",
        status: "completed",
        amount: 150000,
        dueDate: "2026/09/15",
      },
    ],

    activities: [
      {
        id: 1,
        type: "meeting",
        title: "ECサイト改善打ち合わせ",
        description:
          "購入導線と商品ページ改善についてヒアリング。",
        date: "2026/09/27",
      },
    ],
  },
];

/**
 * 顧客IDから1件の顧客詳細を取得する。
 *
 * 現在はMock配列からfind()しているが、
 * Laravel API接続後はAPI通信へ置き換える。
 */
export function findCustomerDetailById(
  id: number,
): CustomerDetail | undefined {
  return customerDetails.find(
    (customer) => customer.id === id,
  );
}