"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Save,
  UserRound,
} from "lucide-react";

import {
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import type {
  ProjectCustomerOption,
  ProjectFormData,
  ProjectFormErrors,
  ProjectFormMode,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";

/**
 * ProjectFormへ渡すProps。
 *
 * mode:
 *   create / edit のどちらで使用するか。
 *
 * customerOptions:
 *   顧客選択selectへ表示する顧客一覧。
 *
 * projectId:
 *   編集時に使用する案件ID。
 *
 * initialData:
 *   編集時に既存データをフォームへ初期表示するため使用する。
 */
type ProjectFormProps = {
  mode: ProjectFormMode;

  customerOptions: ProjectCustomerOption[];

  projectId?: number;

  initialData?: ProjectFormData;
};

/**
 * 新規案件登録時の初期値。
 *
 * HTMLフォームをControlled Componentとして扱うため、
 * undefinedではなく最初から値を用意しておく。
 */
const emptyFormData: ProjectFormData = {
  name: "",
  customerId: "",
  type: "",
  ownerName: "",

  status: "draft",
  priority: "medium",

  amount: "",

  startDate: "",
  dueDate: "",

  progress: "0",

  description: "",
  notes: "",
};

/**
 * 案件ステータスselectへ表示する選択肢。
 *
 * valueはProjectStatus型なので、
 * 定義していないステータスを登録できない。
 */
const STATUS_OPTIONS: {
  value: ProjectStatus;
  label: string;
}[] = [
  {
    value: "draft",
    label: "下書き",
  },
  {
    value: "proposal",
    label: "提案中",
  },
  {
    value: "negotiation",
    label: "商談中",
  },
  {
    value: "in_progress",
    label: "進行中",
  },
  {
    value: "completed",
    label: "完了",
  },
  {
    value: "cancelled",
    label: "中止",
  },
];

/**
 * 案件優先度selectへ表示する選択肢。
 */
const PRIORITY_OPTIONS: {
  value: ProjectPriority;
  label: string;
}[] = [
  {
    value: "high",
    label: "高",
  },
  {
    value: "medium",
    label: "中",
  },
  {
    value: "low",
    label: "低",
  },
];

/**
 * 案件新規登録・編集で共通利用するフォーム。
 *
 * 現段階ではLaravel APIへデータを送信せず、
 *
 * ・入力値管理
 * ・TypeScript型制御
 * ・Validation
 * ・Validationエラー表示
 * ・create/editでのフォーム再利用
 *
 * まで実装する。
 */
export default function ProjectForm({
  mode,
  customerOptions,
  projectId,
  initialData,
}: ProjectFormProps) {
  /**
   * フォーム全体の入力値。
   *
   * 編集：
   * initialData
   *
   * 新規：
   * emptyFormData
   */
  const [formData, setFormData] =
    useState<ProjectFormData>(
      initialData ?? emptyFormData,
    );

  /**
   * 入力エラーを管理するState。
   */
  const [errors, setErrors] =
    useState<ProjectFormErrors>({});

  /**
   * API未接続期間の送信確認メッセージ。
   *
   * 本当にDB登録されたわけではないことが分かる
   * メッセージにしておく。
   */
  const [submitMessage, setSubmitMessage] =
    useState<string | null>(null);

  /**
   * フォームの1項目を型安全に更新する共通関数。
   *
   * K extends keyof ProjectFormData
   *
   * によって、
   *
   * name
   * customerId
   * status
   * amount
   *
   * などProjectFormDataに存在する項目だけを指定できる。
   *
   * CustomerFormと同じ設計思想を利用している。
   */
  const updateField = <
    K extends keyof ProjectFormData,
  >(
    field: K,
    value: ProjectFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    /**
     * ユーザーが入力し直した項目の
     * Validationエラーを解除する。
     */
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    /**
     * フォームを変更した場合は
     * 前回の成功メッセージを消す。
     */
    setSubmitMessage(null);
  };

  /**
   * フォーム全体のValidation。
   */
  const validate =
    (): ProjectFormErrors => {
      const newErrors: ProjectFormErrors =
        {};

      /* -------------------------------
       * 案件名
       * ------------------------------- */
      if (formData.name.trim() === "") {
        newErrors.name =
          "案件名を入力してください。";
      }

      /* -------------------------------
       * 顧客
       * ------------------------------- */
      if (
        formData.customerId.trim() === ""
      ) {
        newErrors.customerId =
          "顧客を選択してください。";
      }

      /* -------------------------------
       * 担当者
       * ------------------------------- */
      if (
        formData.ownerName.trim() === ""
      ) {
        newErrors.ownerName =
          "担当者を入力してください。";
      }

      /* -------------------------------
       * 金額
       * ------------------------------- */
      if (formData.amount.trim() === "") {
        newErrors.amount =
          "案件金額を入力してください。";
      } else {
        const amount = Number(
          formData.amount,
        );

        if (
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          newErrors.amount =
            "案件金額は0以上の数値で入力してください。";
        }
      }

      /* -------------------------------
       * 開始日
       * ------------------------------- */
      if (
        formData.startDate.trim() === ""
      ) {
        newErrors.startDate =
          "開始日を入力してください。";
      }

      /* -------------------------------
       * 期限
       * ------------------------------- */
      if (
        formData.dueDate.trim() === ""
      ) {
        newErrors.dueDate =
          "期限を入力してください。";
      }

      /**
       * HTML date inputは
       * YYYY-MM-DD形式になるため、
       * 文字列比較でも日付順を比較できる。
       *
       * 期限が開始日より前ならエラー。
       */
      if (
        formData.startDate !== "" &&
        formData.dueDate !== "" &&
        formData.dueDate <
          formData.startDate
      ) {
        newErrors.dueDate =
          "期限は開始日以降の日付を指定してください。";
      }

      /* -------------------------------
       * 進捗率
       * ------------------------------- */
      if (
        formData.progress.trim() === ""
      ) {
        newErrors.progress =
          "進捗率を入力してください。";
      } else {
        const progress = Number(
          formData.progress,
        );

        if (
          !Number.isFinite(progress) ||
          progress < 0 ||
          progress > 100
        ) {
          newErrors.progress =
            "進捗率は0〜100で入力してください。";
        }
      }

      return newErrors;
    };

  /**
   * Form送信。
   *
   * 現段階ではValidationのみ実施する。
   */
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    /**
     * 通常のHTMLフォーム送信による
     * ページ再読み込みを防止する。
     */
    event.preventDefault();

    const validationErrors =
      validate();

    setErrors(validationErrors);

    /**
     * Validation Errorが1件でも存在した場合、
     * ここで処理終了。
     */
    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setSubmitMessage(null);
      return;
    }

    /**
     * Laravel API実装後はここで、
     *
     * create:
     * POST /api/v1/projects
     *
     * edit:
     * PUT /api/v1/projects/{id}
     *
     * を実行する予定。
     *
     * amount / progress / customerIdは
     * numberへ変換して送信する。
     */
    if (mode === "create") {
      setSubmitMessage(
        "入力内容の確認に成功しました。API接続後はここで案件を登録します。",
      );
    } else {
      setSubmitMessage(
        "入力内容の確認に成功しました。API接続後はここで案件情報を更新します。",
      );
    }
  };

  /**
   * キャンセル時の戻り先。
   *
   * 編集：
   * /projects/{id}
   *
   * 新規：
   * /projects
   */
  const cancelHref =
    mode === "edit" &&
    projectId !== undefined
      ? `/projects/${projectId}`
      : "/projects";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      {/* =====================================================
       * 基本情報
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={BriefcaseBusiness}
          title="案件基本情報"
          description="案件名・顧客・案件種別などを入力します。"
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* 案件名 */}
          <FormField
            label="案件名"
            required
            error={errors.name}
          >
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              placeholder="例：コーポレートサイトリニューアル"
              className={inputClass(
                errors.name,
              )}
            />
          </FormField>

          {/* 顧客 */}
          <FormField
            label="顧客"
            required
            error={errors.customerId}
          >
            <select
              value={formData.customerId}
              onChange={(event) =>
                updateField(
                  "customerId",
                  event.target.value,
                )
              }
              className={inputClass(
                errors.customerId,
              )}
            >
              <option value="">
                顧客を選択してください
              </option>

              {customerOptions.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={String(
                      customer.id,
                    )}
                  >
                    {customer.name}
                  </option>
                ),
              )}
            </select>
          </FormField>

          {/* 案件種別 */}
          <FormField label="案件種別">
            <input
              type="text"
              value={formData.type}
              onChange={(event) =>
                updateField(
                  "type",
                  event.target.value,
                )
              }
              placeholder="例：Webサイト制作"
              className={inputClass()}
            />
          </FormField>

          {/* 担当者 */}
          <FormField
            label="担当者"
            required
            error={errors.ownerName}
          >
            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  formData.ownerName
                }
                onChange={(event) =>
                  updateField(
                    "ownerName",
                    event.target.value,
                  )
                }
                placeholder="例：山田 太郎"
                className={`${inputClass(
                  errors.ownerName,
                )} pl-11`}
              />
            </div>
          </FormField>
        </div>
      </section>

      {/* =====================================================
       * ステータス・金額
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={CircleDollarSign}
          title="ステータス・金額"
          description="案件の進行状態・優先度・金額を設定します。"
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Status */}
          <FormField label="ステータス">
            <select
              value={formData.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target
                    .value as ProjectStatus,
                )
              }
              className={inputClass()}
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </FormField>

          {/* Priority */}
          <FormField label="優先度">
            <select
              value={formData.priority}
              onChange={(event) =>
                updateField(
                  "priority",
                  event.target
                    .value as ProjectPriority,
                )
              }
              className={inputClass()}
            >
              {PRIORITY_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </FormField>

          {/* Amount */}
          <FormField
            label="案件金額"
            required
            error={errors.amount}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ¥
              </span>

              <input
                type="number"
                min="0"
                step="1000"
                value={formData.amount}
                onChange={(event) =>
                  updateField(
                    "amount",
                    event.target.value,
                  )
                }
                placeholder="550000"
                className={`${inputClass(
                  errors.amount,
                )} pl-9`}
              />
            </div>
          </FormField>

          {/* Progress */}
          <FormField
            label="進捗率"
            required
            error={errors.progress}
          >
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={
                  formData.progress
                }
                onChange={(event) =>
                  updateField(
                    "progress",
                    event.target.value,
                  )
                }
                className={`${inputClass(
                  errors.progress,
                )} pr-10`}
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
          </FormField>
        </div>
      </section>

      {/* =====================================================
       * スケジュール
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={CalendarDays}
          title="スケジュール"
          description="案件の開始日と期限を設定します。"
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Start */}
          <FormField
            label="開始日"
            required
            error={errors.startDate}
          >
            <input
              type="date"
              value={
                formData.startDate
              }
              onChange={(event) =>
                updateField(
                  "startDate",
                  event.target.value,
                )
              }
              className={inputClass(
                errors.startDate,
              )}
            />
          </FormField>

          {/* Due */}
          <FormField
            label="期限"
            required
            error={errors.dueDate}
          >
            <input
              type="date"
              value={formData.dueDate}
              onChange={(event) =>
                updateField(
                  "dueDate",
                  event.target.value,
                )
              }
              className={inputClass(
                errors.dueDate,
              )}
            />
          </FormField>
        </div>
      </section>

      {/* =====================================================
       * 案件内容
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={FileText}
          title="案件内容"
          description="案件概要や補足メモを入力します。"
        />

        <div className="mt-6 space-y-5">
          {/* Description */}
          <FormField label="案件概要">
            <textarea
              value={
                formData.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              rows={6}
              placeholder="案件の目的や対応内容を入力してください。"
              className={textareaClass()}
            />
          </FormField>

          {/* Notes */}
          <FormField label="メモ">
            <textarea
              value={formData.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              rows={4}
              placeholder="案件に関する補足事項を入力してください。"
              className={textareaClass()}
            />
          </FormField>
        </div>
      </section>

      {/* =====================================================
       * Validation成功
       * ===================================================== */}
      {submitMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {submitMessage}
        </div>
      )}

      {/* =====================================================
       * 操作
       * ===================================================== */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          キャンセル
        </Link>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Save size={18} />

          {mode === "create"
            ? "案件を登録"
            : "変更を保存"}
        </button>
      </div>
    </form>
  );
}


/* =========================================================
 * 共通UI
 * ========================================================= */

/**
 * 各カード上部のHeader。
 */
type SectionHeaderProps = {
  icon: ComponentType<{
    size?: number;
  }>;

  title: string;

  description: string;
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * input・select・textareaの
 * labelとValidationエラーを共通化する。
 */
type FormFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

function FormField({
  label,
  required = false,
  error,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <span className="mt-2 block text-xs font-medium text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * input/select共通Tailwind CSS。
 *
 * Validation Errorが存在する場合だけ
 * 赤いborderへ変更する。
 */
function inputClass(
  error?: string,
): string {
  return [
    "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400",

    error
      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
      : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100",
  ].join(" ");
}

/**
 * textarea共通CSS。
 */
function textareaClass(): string {
  return "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
}