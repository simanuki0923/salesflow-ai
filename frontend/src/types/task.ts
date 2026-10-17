/**
 * Task Status。
 *
 * Laravel側のTask APIと
 * 同じ値だけを使用する。
 *
 * todo:
 *   未着手
 *
 * in_progress:
 *   対応中
 *
 * completed:
 *   完了
 *
 * cancelled:
 *   中止
 */
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Task Priority。
 *
 * Backend側と同じ、
 *
 * high
 * medium
 * low
 *
 * の3種類を使用する。
 */
export type TaskPriority =
  | "high"
  | "medium"
  | "low";

/**
 * Task一覧・詳細画面で使用する
 * Frontend側のTaskデータ。
 *
 * Laravel TaskResourceが返すJSONを
 * Frontendで扱いやすい形として定義する。
 */
export type Task = {
  /** Task ID */
  id: number;

  /**
   * Taskが所属するProject ID。
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

  /** Task名 */
  title: string;

  /**
   * Task詳細。
   *
   * 未登録の場合があるため
   * nullを許可する。
   */
  description: string | null;

  /** Task Status */
  status: TaskStatus;

  /** Task Priority */
  priority: TaskPriority;

  /**
   * Task期限。
   *
   * Backend側ではnullableのため、
   * 未設定の場合はnull。
   */
  dueDate: string | null;

  /**
   * 完了日時。
   *
   * statusがcompletedの場合に
   * Laravel側で自動設定される。
   */
  completedAt: string | null;

  /** 作成日時 */
  createdAt: string;

  /** 更新日時 */
  updatedAt: string;
};

/**
 * Task登録・編集Formで使用する値。
 *
 * HTML selectのProject IDは
 * stringとして扱うため、
 * API送信前にnumberへ変換する。
 *
 * dueDateは、
 * 期限未設定の場合は空文字で管理し、
 * API送信時にnullへ変換する。
 */
export type TaskFormData = {
  /** 所属Project */
  projectId: string;

  /** Task名 */
  title: string;

  /** Task詳細 */
  description: string;

  /** Task Status */
  status: TaskStatus;

  /** Task Priority */
  priority: TaskPriority;

  /** Task期限 */
  dueDate: string;
};

/**
 * Task FormのValidation Error。
 *
 * 各Form Fieldに対して、
 * Error Messageを保持する。
 */
export type TaskFormErrors =
  Partial<
    Record<
      keyof TaskFormData,
      string
    >
  >;

/**
 * Task FormのProject選択肢。
 *
 * Taskは必ずProjectへ所属するため、
 * 新規登録・編集画面のselectで使用する。
 *
 * customerNameも保持することで、
 *
 * 案件名 / 顧客名
 *
 * の形で選択肢を表示できる。
 */
export type TaskProjectOption = {
  id: number;

  name: string;

  customerName: string;
};

/**
 * Task Formを使用するMode。
 */
export type TaskFormMode =
  | "create"
  | "edit";