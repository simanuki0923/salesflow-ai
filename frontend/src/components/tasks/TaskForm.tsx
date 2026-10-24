"use client";

import Link from "next/link";
import {
  Save,
  Trash2,
} from "lucide-react";
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
  createTask,
  deleteTask,
  updateTask,
} from "@/lib/api/tasks";

import type {
  TaskFormData,
  TaskFormErrors,
  TaskFormMode,
  TaskProjectOption,
} from "@/types/task";

/**
 * TaskFormへ渡すProps。
 *
 * create:
 *   新規登録なのでtaskId / initialDataは不要。
 *
 * edit:
 *   編集対象TaskのIDと、
 *   API取得値を変換したinitialDataを使用する。
 */
type TaskFormProps = {
  mode: TaskFormMode;

  projectOptions: TaskProjectOption[];

  taskId?: number;

  initialData?: TaskFormData;
};

/**
 * Task新規登録時の初期値。
 *
 * projectIdはHTML selectのvalueとして扱うため
 * stringで保持する。
 *
 * dueDateは未設定を許可するため、
 * 初期値は空文字とする。
 */
const emptyFormData: TaskFormData = {
  projectId: "",
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

/**
 * Form Input共通Class。
 */
const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

/**
 * Task新規登録・編集共通Form。
 *
 * データの流れ：
 *
 * TaskForm
 * ↓
 * createTask / updateTask / deleteTask
 * ↓
 * Laravel Task REST API
 * ↓
 * TaskController
 * ↓
 * PostgreSQL
 */
export default function TaskForm({
  mode,
  projectOptions,
  taskId,
  initialData,
}: TaskFormProps) {
  const router =
    useRouter();

  const {
    isReadOnly,
  } = useDemoMode();

  /**
   * 現在のForm値。
   */
  const [
    formData,
    setFormData,
  ] = useState<TaskFormData>(
    initialData ??
      emptyFormData,
  );

  /**
   * Field単位Validation Error。
   */
  const [
    errors,
    setErrors,
  ] = useState<TaskFormErrors>({});

  /**
   * API全体のError。
   */
  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  );

  /**
   * 保存通信中。
   */
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /**
   * 削除通信中。
   */
  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  /**
   * Form Field共通更新処理。
   *
   * Genericを使うことで、
   * TaskFormDataの各Field型を維持する。
   */
  const updateField = <
    K extends keyof TaskFormData,
  >(
    field: K,
    value: TaskFormData[K],
  ): void => {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    /**
     * 入力を修正したFieldの
     * Validation Errorを解除する。
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
   * Backend Validationが最終的な
   * データ整合性保証を担当する。
   *
   * Frontendでは入力時の使いやすさを
   * 主目的として最低限Validationする。
   */
  const validate =
    (): TaskFormErrors => {
      const nextErrors:
        TaskFormErrors = {};

      /**
       * Taskは必ずProjectへ所属する。
       */
      if (
        formData.projectId === ""
      ) {
        nextErrors.projectId =
          "案件を選択してください。";
      }

      /**
       * Task名は必須。
       */
      if (
        formData.title.trim() === ""
      ) {
        nextErrors.title =
          "タスク名を入力してください。";
      }

      return nextErrors;
    };

  /**
   * Laravel 422 Validation Errorを
   * TaskFormErrorsへ変換する。
   */
  const mapApiValidationErrors = (
    error: ApiError,
  ): TaskFormErrors => {
    const apiErrors:
      TaskFormErrors = {};

    const fields =
      Object.keys(
        formData,
      ) as Array<
        keyof TaskFormData
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
   * Task保存処理。
   *
   * create:
   *   POST /api/v1/tasks
   *
   * edit:
   *   PATCH /api/v1/tasks/{task}
   */
  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    /**
     * Demo Read Only Modeでは
     * Frontendから保存Requestを送信しない。
     */
    if (isReadOnly) {
      setSubmitError(
        "Demo Modeではデータを保存できません。",
      );

      return;
    }

    const validationErrors =
      validate();

    setErrors(
      validationErrors,
    );

    setSubmitError(null);

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
        await createTask(
          formData,
        );

        /**
         * Task詳細ページは現段階では作らないため、
         * 登録後は一覧画面へ戻す。
         */
        router.push(
          "/tasks",
        );

        router.refresh();

        return;
      }

      if (
        taskId === undefined
      ) {
        throw new Error(
          "タスクIDが取得できません。",
        );
      }

      await updateTask(
        taskId,
        formData,
      );

      router.push(
        "/tasks",
      );

      router.refresh();
    } catch (error) {
      if (
        error instanceof ApiError
      ) {
        setErrors(
          (current) => ({
            ...current,
            ...mapApiValidationErrors(
              error,
            ),
          }),
        );

        setSubmitError(
          error.message,
        );

        return;
      }

      setSubmitError(
        "タスク情報の保存に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Task削除。
   *
   * 編集画面の場合だけ使用する。
   */
  const handleDelete =
    async (): Promise<void> => {
      /**
       * Demo Read Only Modeでは
       * Frontendから削除Requestを送信しない。
       */
      if (isReadOnly) {
        setSubmitError(
          "Demo Modeではデータを削除できません。",
        );

        return;
      }

      if (
        mode !== "edit" ||
        taskId === undefined
      ) {
        return;
      }

      /**
       * 誤操作防止のため、
       * Browser標準確認Dialogを表示する。
       */
      const confirmed =
        window.confirm(
          "このタスクを削除しますか？",
        );

      if (!confirmed) {
        return;
      }

      setSubmitError(null);
      setIsDeleting(true);

      try {
        await deleteTask(
          taskId,
        );

        router.push(
          "/tasks",
        );

        router.refresh();
      } catch (error) {
        if (
          error instanceof ApiError
        ) {
          setSubmitError(
            error.message,
          );

          return;
        }

        setSubmitError(
          "タスクの削除に失敗しました。",
        );
      } finally {
        setIsDeleting(false);
      }
    };

  const disabled =
    isSubmitting ||
    isDeleting;

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/* ================================================
       * Task基本情報
       * ================================================ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            タスク基本情報
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            案件・タスク名・ステータス・優先度を設定します。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Project */}
          <div className="md:col-span-2">
            <label
              htmlFor="task-project"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              案件
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              id="task-project"
              value={
                formData.projectId
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "projectId",
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            >
              <option value="">
                案件を選択してください
              </option>

              {projectOptions.map(
                (project) => (
                  <option
                    key={
                      project.id
                    }
                    value={
                      String(
                        project.id,
                      )
                    }
                  >
                    {
                      project.name
                    }
                    {" / "}
                    {
                      project.customerName
                    }
                  </option>
                ),
              )}
            </select>

            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.projectId
                }
              </p>
            )}
          </div>

          {/* Task Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              タスク名
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="task-title"
              type="text"
              value={
                formData.title
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              placeholder="提案資料を作成する"
              className={
                inputClassName
              }
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="task-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              ステータス
            </label>

            <select
              id="task-status"
              value={
                formData.status
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target
                    .value as TaskFormData["status"],
                )
              }
              className={
                inputClassName
              }
            >
              <option value="todo">
                未着手
              </option>

              <option value="in_progress">
                対応中
              </option>

              <option value="completed">
                完了
              </option>

              <option value="cancelled">
                中止
              </option>
            </select>

            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="task-priority"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              優先度
            </label>

            <select
              id="task-priority"
              value={
                formData.priority
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "priority",
                  event.target
                    .value as TaskFormData["priority"],
                )
              }
              className={
                inputClassName
              }
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

            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.priority
                }
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              期限
            </label>

            <input
              id="task-due-date"
              type="date"
              value={
                formData.dueDate
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "dueDate",
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />

            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.dueDate
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================================================
       * Task詳細
       * ================================================ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          タスク詳細
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          作業内容や補足情報を入力します。
        </p>

        <div className="mt-5">
          <label
            htmlFor="task-description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            詳細
          </label>

          <textarea
            id="task-description"
            rows={6}
            value={
              formData.description
            }
            disabled={disabled}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value,
              )
            }
            placeholder="タスクの具体的な作業内容を入力してください。"
            className={
              inputClassName
            }
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {
                errors.description
              }
            </p>
          )}
        </div>
      </section>

      {/* API Error */}
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* ================================================
       * 操作Button
       * ================================================ */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              disabled={disabled || isReadOnly}
              onClick={
                handleDelete
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2
                size={18}
              />

              {isDeleting
                ? "削除中..."
                : "タスクを削除"}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            href="/tasks"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            キャンセル
          </Link>

          <button
            type="submit"
            disabled={disabled || isReadOnly}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={18}
            />

            {isSubmitting
              ? "保存中..."
              : mode === "create"
                ? "登録する"
                : "更新する"}
          </button>
        </div>
      </div>
    </form>
  );
}