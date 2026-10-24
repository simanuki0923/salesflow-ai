"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

import {
  ApiError,
} from "@/lib/api/client";

import {
  useDemoMode,
} from "@/components/demo/DemoModeProvider";

import {
  createProject,
  updateProject,
} from "@/lib/api/projects";

import type {
  ProjectCustomerOption,
  ProjectFormData,
  ProjectFormErrors,
  ProjectFormMode,
} from "@/types/project";

/**
 * ProjectFormへ渡すProps。
 *
 * create:
 *   新規登録なのでprojectId / initialDataは不要。
 *
 * edit:
 *   編集対象を特定するprojectIdと、
 *   現在のDB値を変換したinitialDataを利用する。
 */
type ProjectFormProps = {
  mode: ProjectFormMode;

  customerOptions: ProjectCustomerOption[];

  projectId?: number;

  initialData?: ProjectFormData;
};

/**
 * 新規Project登録時の初期値。
 *
 * HTMLのinput/selectでは、
 * number型の値も入力中はstringとして扱う方が
 * ReactのControlled Componentとして管理しやすい。
 *
 * そのため、
 *
 * customerId
 * amount
 * progress
 *
 * もForm内部ではstringとして保持し、
 * API送信直前にnumberへ変換する。
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
 * Input共通Class。
 *
 * 同じTailwind CSSを各inputへ繰り返し書かないことで、
 * Form全体のデザイン変更もしやすくする。
 */
const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

/**
 * Project新規登録・編集共通Form。
 *
 * データの流れ：
 *
 * ProjectForm
 *      ↓
 * createProject / updateProject
 *      ↓
 * Laravel REST API
 *      ↓
 * ProjectController
 *      ↓
 * PostgreSQL
 */
export default function ProjectForm({
  mode,
  customerOptions,
  projectId,
  initialData,
}: ProjectFormProps) {
  /**
   * 保存成功後に、
   * Project詳細画面へ遷移するため使用する。
   */
  const router = useRouter();

  const {
    isReadOnly,
  } = useDemoMode();

  /**
   * Formの現在値。
   *
   * 編集時：
   *   APIから取得したinitialData
   *
   * 新規時：
   *   emptyFormData
   */
  const [
    formData,
    setFormData,
  ] = useState<ProjectFormData>(
    initialData ?? emptyFormData,
  );

  /**
   * Field単位のValidation Error。
   *
   * 例：
   *
   * {
   *   name: "案件名を入力してください。",
   *   dueDate: "期限は開始日以降..."
   * }
   */
  const [
    errors,
    setErrors,
  ] = useState<ProjectFormErrors>({});

  /**
   * API通信そのもののError。
   *
   * Field Errorとは別に、
   * Form下部へまとめて表示する。
   */
  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null);

  /**
   * API送信中かどうか。
   *
   * trueの間は保存Buttonをdisabledにして、
   * 二重POST/PATCHを防ぐ。
   */
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /**
   * Form Field共通更新処理。
   *
   * Genericを利用することで、
   *
   * statusにはProjectStatus
   * priorityにはProjectPriority
   * その他にはstring
   *
   * というProjectFormDataの型関係を維持する。
   */
  const updateField = <
    K extends keyof ProjectFormData,
  >(
    field: K,
    value: ProjectFormData[K],
  ): void => {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    /**
     * ユーザーが値を修正したFieldについては、
     * 一度表示したValidation Errorを解除する。
     */
    setErrors(
      (current) => ({
        ...current,
        [field]: undefined,
      }),
    );
  };

  /**
   * Frontend側Validation。
   *
   * Frontend Validation：
   *   入力時の使いやすさ向上
   *
   * Laravel Validation：
   *   DBへ保存するデータの整合性保証
   *
   * という役割分担にする。
   */
  const validate =
    (): ProjectFormErrors => {
      const nextErrors:
        ProjectFormErrors = {};

      /**
       * 案件名。
       */
      if (
        formData.name.trim() === ""
      ) {
        nextErrors.name =
          "案件名を入力してください。";
      }

      /**
       * Customer。
       *
       * Projectは必ずCustomerへ所属するため必須。
       */
      if (
        formData.customerId === ""
      ) {
        nextErrors.customerId =
          "顧客を選択してください。";
      }

      /**
       * 案件担当者。
       */
      if (
        formData.ownerName.trim() === ""
      ) {
        nextErrors.ownerName =
          "担当者名を入力してください。";
      }

      /**
       * 金額。
       *
       * Form内部ではstringだが、
       * 数値として解釈可能かを確認する。
       */
      if (
        formData.amount.trim() === ""
      ) {
        nextErrors.amount =
          "案件金額を入力してください。";
      } else {
        const amount =
          Number(formData.amount);

        if (
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          nextErrors.amount =
            "案件金額は0以上の数値で入力してください。";
        }
      }

      /**
       * 開始日。
       */
      if (
        formData.startDate === ""
      ) {
        nextErrors.startDate =
          "開始日を入力してください。";
      }

      /**
       * 期限。
       */
      if (
        formData.dueDate === ""
      ) {
        nextErrors.dueDate =
          "期限を入力してください。";
      }

      /**
       * HTML date inputはYYYY-MM-DDなので、
       * 同形式同士なら文字列比較でも日付順を比較できる。
       */
      if (
        formData.startDate !== "" &&
        formData.dueDate !== "" &&
        formData.dueDate <
          formData.startDate
      ) {
        nextErrors.dueDate =
          "期限は開始日以降の日付を指定してください。";
      }

      /**
       * 進捗率。
       */
      if (
        formData.progress.trim() === ""
      ) {
        nextErrors.progress =
          "進捗率を入力してください。";
      } else {
        const progress =
          Number(formData.progress);

        if (
          !Number.isFinite(progress) ||
          progress < 0 ||
          progress > 100
        ) {
          nextErrors.progress =
            "進捗率は0〜100で入力してください。";
        }
      }

      return nextErrors;
    };

  /**
   * Laravelが返した422 Validation Errorを、
   * ProjectFormErrorsへ変換する。
   *
   * Laravel：
   *
   * {
   *   "errors": {
   *     "customerId": [
   *       "The selected customer id is invalid."
   *     ]
   *   }
   * }
   *
   * ↓
   *
   * React：
   *
   * {
   *   customerId: "..."
   * }
   */
  const mapApiValidationErrors = (
    error: ApiError,
  ): ProjectFormErrors => {
    const apiErrors:
      ProjectFormErrors = {};

    const fields =
      Object.keys(
        formData,
      ) as Array<
        keyof ProjectFormData
      >;

    for (
      const field of fields
    ) {
      const message =
        error.validationErrors[
          field
        ]?.[0];

      if (message) {
        apiErrors[field] =
          message;
      }
    }

    return apiErrors;
  };

  /**
   * Form Submit処理。
   *
   * create：
   *
   * POST /api/v1/projects
   *
   * edit：
   *
   * PATCH /api/v1/projects/{project}
   */
  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    /**
     * Demo Read Only Modeでは、
     * Enter Key等でSubmitされても
     * APIへ書き込みRequestを送信しない。
     */
    if (isReadOnly) {
      setSubmitError(
        "Demo Modeではデータを保存できません。",
      );

      return;
    }

    /**
     * API通信前にFrontend Validation。
     */
    const validationErrors =
      validate();

    setErrors(
      validationErrors,
    );

    setSubmitError(null);

    /**
     * Validation Errorが1件でもあれば
     * Laravel APIは呼び出さない。
     */
    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        /**
         * 新規登録。
         *
         * ProjectFormData
         *      ↓
         * createProject()
         *      ↓
         * 数値変換
         *      ↓
         * POST /api/v1/projects
         *      ↓
         * PostgreSQL INSERT
         */
        const createdProject =
          await createProject(
            formData,
          );

        /**
         * Laravelが採番したIDを使って
         * 新規Project詳細画面へ移動する。
         *
         * 詳細画面はServer Componentなので、
         * 遷移時にLaravel APIから最新データを取得する。
         */
        router.push(
          `/projects/${createdProject.id}`,
        );

        return;
      }

      /**
       * 編集ModeではIDが必要。
       *
       * Props設計上optionalなので、
       * Runtimeでも念のため確認する。
       */
      if (
        projectId === undefined
      ) {
        throw new Error(
          "案件IDが取得できません。",
        );
      }

      /**
       * Project更新。
       *
       * PATCHなのでLaravel側では
       * 部分更新にも対応している。
       */
      await updateProject(
        projectId,
        formData,
      );

      /**
       * 更新後は詳細画面へ戻る。
       */
      router.push(
        `/projects/${projectId}`,
      );
    } catch (error) {
      /**
       * Laravel APIから返されたError。
       */
      if (
        error instanceof ApiError
      ) {
        /**
         * Laravel Validation Errorを
         * 各Fieldへ反映する。
         */
        setErrors(
          (current) => ({
            ...current,
            ...mapApiValidationErrors(
              error,
            ),
          }),
        );

        /**
         * API全体のMessageも表示する。
         */
        setSubmitError(
          error.message,
        );

        return;
      }

      /**
       * Laravel停止、
       * Network Error、
       * JavaScript Runtime Errorなど。
       */
      setSubmitError(
        "案件情報の保存に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancelボタンの戻り先。
   */
  const cancelHref =
    mode === "edit" &&
    projectId !== undefined
      ? `/projects/${projectId}`
      : "/projects";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* 案件基本情報 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            案件基本情報
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            案件名・顧客・担当者・ステータスを設定します。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* 案件名 */}
          <div className="md:col-span-2">
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              案件名
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="project-name"
              type="text"
              value={formData.name}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              placeholder="コーポレートサイトリニューアル"
              className={inputClassName}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Customer */}
          <div>
            <label
              htmlFor="project-customer"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              顧客
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              id="project-customer"
              value={
                formData.customerId
              }
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "customerId",
                  event.target.value,
                )
              }
              className={inputClassName}
            >
              <option value="">
                顧客を選択してください
              </option>

              {customerOptions.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>
                ),
              )}
            </select>

            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.customerId}
              </p>
            )}
          </div>

          {/* 案件種別 */}
          <div>
            <label
              htmlFor="project-type"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              案件種別
            </label>

            <input
              id="project-type"
              type="text"
              value={formData.type}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "type",
                  event.target.value,
                )
              }
              placeholder="Webサイト制作"
              className={inputClassName}
            />
          </div>

          {/* 担当者 */}
          <div>
            <label
              htmlFor="project-owner"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              担当者
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="project-owner"
              type="text"
              value={
                formData.ownerName
              }
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "ownerName",
                  event.target.value,
                )
              }
              placeholder="山田 太郎"
              className={inputClassName}
            />

            {errors.ownerName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.ownerName}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="project-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              ステータス
            </label>

            <select
              id="project-status"
              value={formData.status}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as
                    ProjectFormData["status"],
                )
              }
              className={inputClassName}
            >
              <option value="draft">
                下書き
              </option>

              <option value="proposal">
                提案中
              </option>

              <option value="negotiation">
                商談中
              </option>

              <option value="in_progress">
                進行中
              </option>

              <option value="completed">
                完了
              </option>

              <option value="cancelled">
                中止
              </option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="project-priority"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              優先度
            </label>

            <select
              id="project-priority"
              value={
                formData.priority
              }
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "priority",
                  event.target.value as
                    ProjectFormData["priority"],
                )
              }
              className={inputClassName}
            >
              <option value="high">
                高
              </option>

              <option value="medium">
                中
              </option>

              <option value="low">
                低
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* 金額・期間・進捗 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            金額・期間・進捗
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            案件の予算・開始日・期限・現在の進捗を設定します。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* 金額 */}
          <div>
            <label
              htmlFor="project-amount"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              案件金額
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="project-amount"
              type="number"
              min="0"
              step="1"
              value={formData.amount}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "amount",
                  event.target.value,
                )
              }
              placeholder="500000"
              className={inputClassName}
            />

            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount}
              </p>
            )}
          </div>

          {/* 進捗 */}
          <div>
            <label
              htmlFor="project-progress"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              進捗率（%）
            </label>

            <input
              id="project-progress"
              type="number"
              min="0"
              max="100"
              step="1"
              value={
                formData.progress
              }
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "progress",
                  event.target.value,
                )
              }
              className={inputClassName}
            />

            {errors.progress && (
              <p className="mt-1 text-sm text-red-600">
                {errors.progress}
              </p>
            )}
          </div>

          {/* 開始日 */}
          <div>
            <label
              htmlFor="project-start-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              開始日
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="project-start-date"
              type="date"
              value={
                formData.startDate
              }
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "startDate",
                  event.target.value,
                )
              }
              className={inputClassName}
            />

            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startDate}
              </p>
            )}
          </div>

          {/* 期限 */}
          <div>
            <label
              htmlFor="project-due-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              期限
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="project-due-date"
              type="date"
              value={formData.dueDate}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "dueDate",
                  event.target.value,
                )
              }
              className={inputClassName}
            />

            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 案件概要 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="project-description"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          案件概要
        </label>

        <textarea
          id="project-description"
          rows={5}
          value={
            formData.description
          }
          disabled={isSubmitting}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value,
            )
          }
          placeholder="案件の目的や対応内容を入力してください。"
          className={`${inputClassName} resize-y`}
        />
      </section>

      {/* メモ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="project-notes"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          メモ
        </label>

        <textarea
          id="project-notes"
          rows={4}
          value={formData.notes}
          disabled={isSubmitting}
          onChange={(event) =>
            updateField(
              "notes",
              event.target.value,
            )
          }
          placeholder="社内向けの補足情報などを入力してください。"
          className={`${inputClassName} resize-y`}
        />
      </section>

      {/*
       * API通信Error。
       *
       * Laravel Validation Errorの場合は
       * Field単位Errorに加えて概要Messageも表示する。
       */}
      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
        >
          {submitError}
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          キャンセル
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || isReadOnly}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />

          {isSubmitting
            ? "保存中..."
            : mode === "create"
              ? "案件を登録"
              : "変更を保存"}
        </button>
      </div>
    </form>
  );
}