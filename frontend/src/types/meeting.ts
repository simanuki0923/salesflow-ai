/**
 * Meeting Status。
 *
 * Laravel Meeting APIと
 * 同じ値だけを使用する。
 *
 * scheduled:
 *   予定
 *
 * completed:
 *   完了
 *
 * cancelled:
 *   中止
 */
export type MeetingStatus =
  | "scheduled"
  | "completed"
  | "cancelled";

/**
 * Meeting Method。
 *
 * in_person:
 *   対面
 *
 * online:
 *   オンライン
 *
 * phone:
 *   電話
 */
export type MeetingMethod =
  | "in_person"
  | "online"
  | "phone";

/**
 * Meeting一覧・編集画面で使用する
 * Frontend側Meeting Data。
 *
 * Laravel MeetingResourceが返すJSONを
 * Frontend UIで扱うための型。
 */
export type Meeting = {
  /** Meeting ID */
  id: number;

  /**
   * Meetingが所属するProject ID。
   */
  projectId: number;

  /**
   * 一覧表示用Project名。
   */
  projectName: string;

  /**
   * Projectが所属するCustomer名。
   */
  customerName: string;

  /**
   * 商談名。
   */
  title: string;

  /**
   * 商談内容。
   *
   * 未登録の場合はnull。
   */
  description: string | null;

  /**
   * 商談Status。
   */
  status: MeetingStatus;

  /**
   * 商談方法。
   */
  method: MeetingMethod;

  /**
   * 商談予定日時。
   *
   * Laravel MeetingResourceからは
   * ISO 8601形式で返される。
   */
  scheduledAt: string;

  /**
   * 商談予定時間。
   *
   * 分単位。
   *
   * 未登録の場合はnull。
   */
  durationMinutes: number | null;

  /**
   * 訪問場所・Online Meeting情報。
   */
  location: string | null;

  /**
   * 商談結果。
   */
  result: string | null;

  /**
   * 次回対応内容。
   */
  nextAction: string | null;

  /**
   * 商談完了日時。
   *
   * completed Statusの場合に
   * Laravel側で自動設定する。
   */
  completedAt: string | null;

  /** 作成日時 */
  createdAt: string;

  /** 更新日時 */
  updatedAt: string;
};

/**
 * Meeting登録・編集Formで使用する値。
 *
 * HTML Formでは、
 *
 * projectId
 * durationMinutes
 *
 * をstringで管理し、
 * API送信時にnumberへ変換する。
 *
 * nullable項目については
 * Form上では空文字で管理する。
 */
export type MeetingFormData = {
  /** 所属Project */
  projectId: string;

  /** 商談名 */
  title: string;

  /** 商談内容 */
  description: string;

  /** 商談Status */
  status: MeetingStatus;

  /** 商談方法 */
  method: MeetingMethod;

  /**
   * 商談予定日時。
   *
   * input type="datetime-local"で使用する。
   */
  scheduledAt: string;

  /**
   * 商談予定時間。
   *
   * Form上ではstring。
   */
  durationMinutes: string;

  /** 訪問場所・Online Meeting情報 */
  location: string;

  /** 商談結果 */
  result: string;

  /** 次回対応 */
  nextAction: string;
};

/**
 * Meeting Form Validation Error。
 */
export type MeetingFormErrors =
  Partial<
    Record<
      keyof MeetingFormData,
      string
    >
  >;

/**
 * Meeting FormのProject選択肢。
 *
 * 案件名 / 顧客名
 *
 * の形で表示するため、
 * customerNameも保持する。
 */
export type MeetingProjectOption = {
  id: number;

  name: string;

  customerName: string;
};

/**
 * Meeting Form Mode。
 */
export type MeetingFormMode =
  | "create"
  | "edit";
