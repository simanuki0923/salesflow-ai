import type {
  ProjectStatus,
} from "@/types/project";

/**
 * Customerの利用状態。
 *
 * active:
 *   現在取引中
 *
 * inactive:
 *   取引停止・休止
 */
export type CustomerStatus =
  | "active"
  | "inactive";

/**
 * Customer一覧画面で使用する基本情報。
 */
export type Customer = {
  id: number;

  name: string;

  contactName: string;

  email: string;

  phone: string;

  /**
   * Customerに紐づくProject件数。
   *
   * Laravel側ではwithCount('projects')から取得する。
   */
  projectCount: number;

  /**
   * 最終対応日。
   *
   * Laravel APIではYYYY-MM-DD形式。
   */
  lastContactDate: string;

  status: CustomerStatus;
};

/**
 * Customerへ設定されるTag。
 *
 * Tag APIはまだ未実装なので、
 * 現段階では型だけ残している。
 */
export type CustomerTag = {
  id: number;
  name: string;
};

/**
 * Customer詳細画面に表示するProject Status。
 *
 * 以前は、
 *
 * proposal
 * in_progress
 * completed
 *
 * の3種類だけだった。
 *
 * 現在はLaravel Project APIと接続するため、
 * Project本体と同じProjectStatusを利用する。
 */
export type CustomerProjectStatus =
  ProjectStatus;

/**
 * Customer詳細画面に表示するProject概要。
 */
export type CustomerProject = {
  id: number;

  name: string;

  status: CustomerProjectStatus;

  amount: number;

  dueDate: string;
};

/**
 * Customer Activity種別。
 *
 * Activity APIは今後実装予定。
 */
export type CustomerActivityType =
  | "meeting"
  | "call"
  | "email"
  | "note";

/**
 * Customer Activity。
 */
export type CustomerActivity = {
  id: number;

  type: CustomerActivityType;

  title: string;

  description: string;

  date: string;
};

/**
 * Customer詳細画面で利用する型。
 *
 * Customer基本情報へ、
 *
 * ・カナ
 * ・住所
 * ・業種
 * ・Webサイト
 * ・メモ
 * ・Tag
 * ・Project
 * ・Activity
 *
 * を追加している。
 */
export type CustomerDetail =
  Customer & {
    nameKana: string;

    contactNameKana: string;

    postalCode: string;

    address: string;

    industry: string;

    website: string | null;

    memo: string | null;

    tags: CustomerTag[];

    projects: CustomerProject[];

    activities: CustomerActivity[];
  };

/**
 * Customer登録・編集Formで管理するデータ。
 *
 * input要素と相性を良くするため、
 * nullableなDB項目もForm内では空文字で保持する。
 */
export type CustomerFormData = {
  name: string;

  nameKana: string;

  contactName: string;

  contactNameKana: string;

  email: string;

  phone: string;

  postalCode: string;

  address: string;

  industry: string;

  website: string;

  status: CustomerStatus;

  memo: string;
};

/**
 * CustomerFormが、
 *
 * 新規登録なのか
 * 編集なのか
 *
 * を判断するMode。
 */
export type CustomerFormMode =
  | "create"
  | "edit";

/**
 * Form項目単位のValidation Error。
 */
export type CustomerFormErrors =
  Partial<
    Record<
      keyof CustomerFormData,
      string
    >
  >;