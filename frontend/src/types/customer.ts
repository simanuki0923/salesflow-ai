/**
 * 顧客の状態。
 *
 * active:
 *   現在取引・営業対象となっている顧客
 *
 * inactive:
 *   現在は取引していない顧客
 *
 * Union型にすることで、想定外の文字列が
 * statusへ入ることをTypeScript側で防止する。
 */
export type CustomerStatus = "active" | "inactive";

/**
 * 顧客一覧画面で使用する顧客データ。
 *
 * 将来的にはLaravel側のCustomerResourceから返される
 * JSONレスポンスと同じ形へ揃える予定。
 */
export type Customer = {
  /**
   * 顧客を一意に識別するID。
   *
   * Laravel側ではcustomersテーブルのidと対応する。
   */
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

  /**
   * 最終連絡日。
   *
   * 現段階では文字列として扱う。
   * API接続時にはISO形式の日付を受け取る構成も検討する。
   */
  lastContactDate: string;

  /** 顧客状態 */
  status: CustomerStatus;
};