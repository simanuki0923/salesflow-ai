import type {
  Meeting,
} from "@/types/meeting";

import type {
  Task,
} from "@/types/task";

/**
 * 案件ステータス。
 *
 * Laravel側のProject APIでも同じ値を使用し、
 * FrontendとBackendで状態の表現を統一する。
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
 * high / medium / low以外の値が
 * 入ることをTypeScript側で防止する。
 */
export type ProjectPriority =
  | "high"
  | "medium"
  | "low";

/**
 * 案件一覧画面で使用する案件データ。
 *
 * Laravel ProjectResourceから返される
 * JSONをFrontend UI用へ変換して使用する。
 */
export type Project = {
  /** 案件を一意に識別するID */
  id: number;

  /** 案件名 */
  name: string;

  /**
   * 顧客ID。
   *
   * Laravelではcustomers.idと紐付く。
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

/**
 * 案件に関する活動履歴の種類。
 */
export type ProjectActivityType =
  | "meeting"
  | "email"
  | "call"
  | "note";

/**
 * 案件の活動履歴。
 */
export type ProjectActivity = {
  id: number;

  /** 活動種類 */
  type: ProjectActivityType;

  /** 活動タイトル */
  title: string;

  /** 活動内容 */
  description: string;

  /** 活動日 */
  date: string;
};

/**
 * 案件スケジュールの状態。
 */
export type ProjectMilestoneStatus =
  | "planned"
  | "completed";

/**
 * 案件のマイルストーン。
 *
 * 案件開始から納品までの主要予定を表示する。
 */
export type ProjectMilestone = {
  id: number;

  /** スケジュール名 */
  title: string;

  /** 予定日 */
  date: string;

  /** 完了状態 */
  status: ProjectMilestoneStatus;
};

/**
 * 案件詳細画面で使用するデータ。
 *
 * Project型を継承することで、
 *
 * id
 * name
 * customerId
 * customerName
 * status
 * priority
 * amount
 * startDate
 * dueDate
 * progress
 *
 * をそのまま利用する。
 *
 * 「&」を利用して、
 * 詳細画面専用Dataを追加している。
 */
export type ProjectDetail = Project & {
  /** 案件種別 */
  type: string;

  /** 社内担当者 */
  ownerName: string;

  /** 案件概要 */
  description: string;

  /**
   * 補足メモ。
   *
   * 登録されていない場合があるため
   * nullも許可する。
   */
  notes: string | null;

  /**
   * 関連Task。
   *
   * 旧Mock用ProjectTask型ではなく、
   * Task Domainで定義した正式なTask型を使用する。
   */
  tasks: Task[];

  /**
   * 関連Meeting。
   *
   * Meeting APIから取得した、
   * 対象Projectに所属する正式なMeeting Data。
   */
  meetings: Meeting[];

  /** 活動履歴 */
  activities: ProjectActivity[];

  /** 案件スケジュール */
  milestones: ProjectMilestone[];
};

/**
 * 案件登録・編集Formで使用する入力値。
 *
 * HTMLのinput要素から取得する値は
 * 基本的にstringなので、
 * amountやprogressもForm State上では
 * stringとして保持する。
 *
 * Laravel APIへ送信するときに、
 *
 * amount
 * progress
 * customerId
 *
 * をnumberへ変換する。
 */
export type ProjectFormData = {
  /** 案件名 */
  name: string;

  /**
   * 顧客ID。
   *
   * select要素のvalueはstringとして取得されるため、
   * Form内ではstringとして保持する。
   */
  customerId: string;

  /** 案件種別 */
  type: string;

  /** 社内担当者 */
  ownerName: string;

  /** 案件ステータス */
  status: ProjectStatus;

  /** 優先度 */
  priority: ProjectPriority;

  /**
   * 案件金額。
   *
   * HTML inputとの相性を考えて
   * stringで保持する。
   */
  amount: string;

  /** 開始日 */
  startDate: string;

  /** 期限 */
  dueDate: string;

  /**
   * 進捗率。
   *
   * 0〜100を想定する。
   */
  progress: string;

  /** 案件概要 */
  description: string;

  /** 補足メモ */
  notes: string;
};

/**
 * ProjectFormをどの用途で使用するか。
 *
 * create:
 *   案件新規登録
 *
 * edit:
 *   案件編集
 */
export type ProjectFormMode =
  | "create"
  | "edit";

/**
 * ProjectFormのValidation Error。
 *
 * Partialを利用することで、
 * Errorが発生した項目だけ保持できる。
 *
 * keyof ProjectFormDataにより、
 * ProjectFormDataに存在する項目名だけが
 * ErrorのKeyとして使用できる。
 */
export type ProjectFormErrors =
  Partial<
    Record<
      keyof ProjectFormData,
      string
    >
  >;

/**
 * 顧客選択selectで使用する
 * 最小限の顧客情報。
 *
 * 顧客一覧のCustomer型全体を
 * ProjectFormへ渡す必要はないため、
 * idとnameだけを使用する。
 */
export type ProjectCustomerOption = {
  id: number;

  name: string;
};