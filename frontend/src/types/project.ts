/**
 * 案件ステータス。
 *
 * Laravel側でも将来的に同じ値を使用し、
 * フロントエンドとバックエンドで状態の表現を統一する予定。
 *
 * draft:
 *   下書き
 *
 * proposal:
 *   提案中
 *
 * negotiation:
 *   商談・交渉中
 *
 * in_progress:
 *   進行中
 *
 * completed:
 *   完了
 *
 * cancelled:
 *   中止
 */
export type ProjectStatus =
  | "draft"
  | "proposal"
  | "negotiation"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * 案件の優先度。
 *
 * Union型を使用することで、
 * high / medium / low 以外の値が
 * 入ることをTypeScript側で防止する。
 */
export type ProjectPriority =
  | "high"
  | "medium"
  | "low";

/**
 * 案件一覧画面で使用する案件データ。
 *
 * 将来的にはLaravel側のProjectResourceから返す
 * JSONレスポンスと同じ構造へ揃える予定。
 */
export type Project = {
  /** 案件を一意に識別するID */
  id: number;

  /** 案件名 */
  name: string;

  /**
   * 顧客ID。
   *
   * Laravelではcustomers.idと紐付ける。
   */
  customerId: number;

  /** 一覧表示用の顧客名 */
  customerName: string;

  /** 案件ステータス */
  status: ProjectStatus;

  /** 優先度 */
  priority: ProjectPriority;

  /**
   * 案件金額。
   *
   * 数値として保持し、
   * 表示するときに日本円形式へ変換する。
   */
  amount: number;

  /** 開始日 */
  startDate: string;

  /** 期限 */
  dueDate: string;

  /**
   * 案件進捗率。
   *
   * 0〜100を想定する。
   */
  progress: number;
};