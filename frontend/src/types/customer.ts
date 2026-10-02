/**
 * 顧客の取引状態。
 *
 * active:
 *   現在取引中の顧客
 *
 * inactive:
 *   現在は取引を停止している顧客
 *
 * Union型にすることで、
 * 想定外のステータス値が入ることを防止する。
 */
export type CustomerStatus =
  | "active"
  | "inactive";

/**
 * 顧客一覧画面で使用する基本的な顧客情報。
 *
 * 将来的にはLaravel側のCustomerResourceから返す
 * JSONレスポンスと同じ構造に揃える予定。
 */
export type Customer = {
  /** 顧客ID */
  id: number;

  /** 会社名・顧客名 */
  name: string;

  /** 担当者名 */
  contactName: string;

  /** メールアドレス */
  email: string;

  /** 電話番号 */
  phone: string;

  /** 顧客に紐づいている案件数 */
  projectCount: number;

  /** 最終連絡日 */
  lastContactDate: string;

  /** 顧客状態 */
  status: CustomerStatus;
};

/**
 * 顧客に設定するタグ情報。
 *
 * 例：
 * ・重要顧客
 * ・継続取引
 * ・Web制作
 */
export type CustomerTag = {
  id: number;
  name: string;
};

/**
 * 顧客に紐づく案件の状態。
 *
 * 後ほど案件管理機能を本格実装するときに、
 * Project型へ共通化する予定。
 */
export type CustomerProjectStatus =
  | "proposal"
  | "in_progress"
  | "completed";

/**
 * 顧客詳細画面へ表示する関連案件の概要。
 */
export type CustomerProject = {
  id: number;
  name: string;
  status: CustomerProjectStatus;
  amount: number;
  dueDate: string;
};

/**
 * 顧客との活動履歴の種類。
 *
 * meeting:
 *   商談
 *
 * call:
 *   電話
 *
 * email:
 *   メール
 *
 * note:
 *   その他の記録
 */
export type CustomerActivityType =
  | "meeting"
  | "call"
  | "email"
  | "note";

/**
 * 顧客との活動履歴。
 */
export type CustomerActivity = {
  id: number;
  type: CustomerActivityType;
  title: string;
  description: string;
  date: string;
};

/**
 * 顧客詳細画面で使用するデータ。
 *
 * Customer型を継承することで、
 *
 * id
 * name
 * contactName
 * email
 * phone
 * projectCount
 * lastContactDate
 * status
 *
 * をそのまま使用できる。
 *
 * & を利用して詳細画面固有の情報を追加している。
 */
export type CustomerDetail = Customer & {
  /** 会社名カナ */
  nameKana: string;

  /** 担当者名カナ */
  contactNameKana: string;

  /** 郵便番号 */
  postalCode: string;

  /** 住所 */
  address: string;

  /** 業種 */
  industry: string;

  /**
   * WebサイトURL。
   *
   * 未登録の場合はnullを許可する。
   */
  website: string | null;

  /**
   * 顧客メモ。
   *
   * 未登録の場合はnullを許可する。
   */
  memo: string | null;

  /** 顧客タグ */
  tags: CustomerTag[];

  /** 関連案件 */
  projects: CustomerProject[];

  /** 活動履歴 */
  activities: CustomerActivity[];
};