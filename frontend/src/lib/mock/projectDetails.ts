import { projects } from "@/lib/mock/projects";

import type {
  Project,
  ProjectDetail,
} from "@/types/project";

/**
 * ProjectDetailから、
 * すでにProject型に存在している項目を除外した型。
 *
 * ProjectDetail
 * =
 * Project
 * +
 * 詳細画面専用データ
 *
 * なので、ここでは詳細画面専用部分だけを定義する。
 */
type ProjectDetailExtra = Omit<
  ProjectDetail,
  keyof Project
>;

/**
 * 特定案件用の詳細Mockデータ。
 *
 * 案件一覧のprojects.tsに存在する基本データへ、
 * この詳細情報を追加してProjectDetailを作成する。
 */
const projectDetailExtras: Partial<
  Record<number, ProjectDetailExtra>
> = {
  1: {
    type: "Webサイト制作",

    ownerName: "山田 太郎",

    description:
      "既存コーポレートサイトのデザイン・情報構成を見直し、スマートフォン対応と問い合わせ導線の改善を行うリニューアル案件です。",

    notes:
      "トップページのデザイン確認後、下層ページ制作へ進む予定。公開前にクライアント確認期間を確保する。",

    tasks: [
      {
        id: 101,
        title: "トップページデザイン確認",
        assignee: "山田 太郎",
        dueDate: "2026/10/15",
        status: "in_progress",
        priority: "high",
      },
      {
        id: 102,
        title: "下層ページ原稿確認",
        assignee: "佐藤 花子",
        dueDate: "2026/10/25",
        status: "todo",
        priority: "medium",
      },
      {
        id: 103,
        title: "現行サイト調査",
        assignee: "山田 太郎",
        dueDate: "2026/09/10",
        status: "completed",
        priority: "medium",
      },
    ],

    activities: [
      {
        id: 201,
        type: "meeting",
        title: "デザイン方向性打ち合わせ",
        description:
          "トップページの構成、ブランドカラー、スマートフォン表示について確認。",
        date: "2026/10/08",
      },
      {
        id: 202,
        type: "email",
        title: "初稿デザイン送付",
        description:
          "トップページの初稿デザインをメールで送付。",
        date: "2026/10/05",
      },
      {
        id: 203,
        type: "call",
        title: "制作進捗確認",
        description:
          "担当者へ進捗状況と次回確認日について連絡。",
        date: "2026/09/28",
      },
    ],

    milestones: [
      {
        id: 301,
        title: "要件定義",
        date: "2026/09/10",
        status: "completed",
      },
      {
        id: 302,
        title: "デザイン初稿",
        date: "2026/10/05",
        status: "completed",
      },
      {
        id: 303,
        title: "コーディング完了",
        date: "2026/11/10",
        status: "planned",
      },
      {
        id: 304,
        title: "公開予定",
        date: "2026/11/30",
        status: "planned",
      },
    ],
  },

  2: {
    type: "採用サイト",

    ownerName: "佐藤 花子",

    description:
      "採用強化を目的として、会社紹介・社員インタビュー・募集要項を掲載する採用サイトを制作します。",

    notes:
      "社員インタビュー素材の受領後にデザイン作業へ着手予定。",

    tasks: [
      {
        id: 104,
        title: "採用コンテンツ構成作成",
        assignee: "佐藤 花子",
        dueDate: "2026/10/20",
        status: "in_progress",
        priority: "medium",
      },
      {
        id: 105,
        title: "社員インタビュー素材受領",
        assignee: "山田 太郎",
        dueDate: "2026/10/25",
        status: "todo",
        priority: "high",
      },
    ],

    activities: [
      {
        id: 204,
        type: "meeting",
        title: "採用サイト企画打ち合わせ",
        description:
          "求職者へ伝えたい会社の魅力と採用ターゲットを確認。",
        date: "2026/10/02",
      },
    ],

    milestones: [
      {
        id: 305,
        title: "企画・要件整理",
        date: "2026/10/10",
        status: "planned",
      },
      {
        id: 306,
        title: "デザイン確認",
        date: "2026/11/15",
        status: "planned",
      },
      {
        id: 307,
        title: "公開予定",
        date: "2026/12/20",
        status: "planned",
      },
    ],
  },
};

/**
 * 特別な詳細Mockデータがない案件向けの
 * 共通データを生成する。
 *
 * これにより、案件一覧に存在する全案件から
 * 詳細画面へ遷移して確認できる。
 */
function createDefaultExtra(
  project: Project,
): ProjectDetailExtra {
  return {
    type: "その他",

    ownerName: "山田 太郎",

    description: `${project.name}に関する案件です。現在の案件ステータスや進捗状況を管理しています。`,

    notes:
      "現在はUI確認用のMockデータです。Laravel API実装後に実データへ置き換えます。",

    tasks: [
      {
        id: project.id * 100 + 1,
        title: "案件内容の確認",
        assignee: "山田 太郎",
        dueDate: project.dueDate,
        status:
          project.status === "completed"
            ? "completed"
            : "in_progress",
        priority: project.priority,
      },
    ],

    activities: [
      {
        id: project.id * 1000 + 1,
        type: "note",
        title: "案件情報を登録",
        description:
          "案件管理画面へ案件情報を登録しました。",
        date: project.startDate,
      },
    ],

    milestones: [
      {
        id: project.id * 10000 + 1,
        title: "案件開始",
        date: project.startDate,
        status: "completed",
      },
      {
        id: project.id * 10000 + 2,
        title: "完了予定",
        date: project.dueDate,
        status:
          project.status === "completed"
            ? "completed"
            : "planned",
      },
    ],
  };
}

/**
 * 案件IDから案件詳細を取得する。
 *
 * 現在：
 *
 * projects.ts
 * +
 * projectDetailExtras
 *
 * ↓
 *
 * ProjectDetail
 *
 *
 * 将来的には、
 *
 * GET /api/v1/projects/{id}
 *
 * へ置き換える。
 */
export function findProjectDetailById(
  id: number,
): ProjectDetail | undefined {
  /**
   * 案件一覧Mockデータから基本情報を取得する。
   */
  const project = projects.find(
    (item) => item.id === id,
  );

  /**
   * 案件自体が存在しなければundefined。
   */
  if (!project) {
    return undefined;
  }

  /**
   * 特別な詳細データがある場合はそれを使用。
   *
   * なければ共通の詳細データを生成する。
   */
  const extra =
    projectDetailExtras[id] ??
    createDefaultExtra(project);

  /**
   * Spread構文でProjectと詳細データを結合する。
   */
  return {
    ...project,
    ...extra,
  };
}