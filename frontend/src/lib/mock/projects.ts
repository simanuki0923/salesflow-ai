import type { Project } from "@/types/project";

/**
 * 案件一覧画面のUI確認用Mockデータ。
 *
 * 現段階ではLaravel APIが未実装のため、
 * TypeScript上に固定データを用意している。
 *
 * 将来的には、
 *
 * GET /api/v1/projects
 *
 * のレスポンスへ置き換える。
 */
export const projects: Project[] = [
  {
    id: 1,
    name: "コーポレートサイトリニューアル",
    customerId: 1,
    customerName: "株式会社ABC",
    status: "in_progress",
    priority: "high",
    amount: 550000,
    startDate: "2026/09/01",
    dueDate: "2026/11/30",
    progress: 65,
  },
  {
    id: 2,
    name: "採用サイト制作",
    customerId: 1,
    customerName: "株式会社ABC",
    status: "proposal",
    priority: "medium",
    amount: 320000,
    startDate: "2026/10/01",
    dueDate: "2026/12/20",
    progress: 20,
  },
  {
    id: 3,
    name: "ECサイト改善",
    customerId: 2,
    customerName: "株式会社サンプル",
    status: "in_progress",
    priority: "high",
    amount: 420000,
    startDate: "2026/09/15",
    dueDate: "2026/12/10",
    progress: 45,
  },
  {
    id: 4,
    name: "キャンペーンLP制作",
    customerId: 2,
    customerName: "株式会社サンプル",
    status: "completed",
    priority: "medium",
    amount: 150000,
    startDate: "2026/08/01",
    dueDate: "2026/09/15",
    progress: 100,
  },
  {
    id: 5,
    name: "顧客管理システム開発",
    customerId: 3,
    customerName: "合同会社テスト",
    status: "negotiation",
    priority: "high",
    amount: 980000,
    startDate: "2026/10/15",
    dueDate: "2027/01/31",
    progress: 10,
  },
  {
    id: 6,
    name: "会社案内ページ制作",
    customerId: 4,
    customerName: "デザイン株式会社",
    status: "draft",
    priority: "low",
    amount: 180000,
    startDate: "2026/11/01",
    dueDate: "2026/12/15",
    progress: 0,
  },
  {
    id: 7,
    name: "業務システム改修",
    customerId: 5,
    customerName: "システム開発株式会社",
    status: "in_progress",
    priority: "medium",
    amount: 680000,
    startDate: "2026/09/10",
    dueDate: "2026/11/15",
    progress: 75,
  },
  {
    id: 8,
    name: "広告LP制作",
    customerId: 7,
    customerName: "株式会社ブルー",
    status: "cancelled",
    priority: "low",
    amount: 120000,
    startDate: "2026/08/20",
    dueDate: "2026/09/30",
    progress: 30,
  },
];