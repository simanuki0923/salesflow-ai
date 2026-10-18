"use client";

import Link from "next/link";
import {
  LoaderCircle,
  Save,
  Sparkles,
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
  createMeeting,
  deleteMeeting,
  suggestMeeting,
  updateMeeting,
} from "@/lib/api/meetings";

import type {
  MeetingFormData,
  MeetingFormErrors,
  MeetingFormMode,
  MeetingProjectOption,
} from "@/types/meeting";

/**
 * MeetingFormへ渡すProps。
 *
 * create:
 *   新規登録なのでmeetingId / initialDataは不要。
 *
 * edit:
 *   編集対象Meeting IDと、
 *   API取得値から作成したinitialDataを使用する。
 */
type MeetingFormProps = {
  mode: MeetingFormMode;

  projectOptions: MeetingProjectOption[];

  meetingId?: number;

  initialData?: MeetingFormData;
};

/**
 * Meeting新規登録時の初期値。
 *
 * HTML Formのvalueとして扱うため、
 * number項目についてもstringで保持する。
 */
const emptyFormData: MeetingFormData = {
  projectId: "",
  title: "",
  description: "",
  status: "scheduled",
  method: "in_person",
  scheduledAt: "",
  durationMinutes: "",
  location: "",
  result: "",
  nextAction: "",
};

/**
 * Form Input共通Class。
 */
const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

/**
 * Meeting新規登録・編集共通Form。
 *
 * データの流れ：
 *
 * MeetingForm
 * ↓
 * createMeeting / updateMeeting / deleteMeeting
 * ↓
 * Laravel Meeting REST API
 * ↓
 * MeetingController
 * ↓
 * PostgreSQL
 */
export default function MeetingForm({
  mode,
  projectOptions,
  meetingId,
  initialData,
}: MeetingFormProps) {
  const router =
    useRouter();

  /**
   * 現在のForm値。
   */
  const [
    formData,
    setFormData,
  ] = useState<MeetingFormData>(
    initialData ??
      emptyFormData,
  );

  /**
   * Field単位Validation Error。
   */
  const [
    errors,
    setErrors,
  ] = useState<MeetingFormErrors>({});

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
   * AI提案生成中。
   *
   * 保存処理とは独立した通信状態として管理する。
   */
  const [
    isAiSuggesting,
    setIsAiSuggesting,
  ] = useState(false);

  /**
   * AI提案専用Error。
   *
   * 通常のMeeting保存Errorとは分離することで、
   * AI提案に失敗してもForm入力や通常保存を
   * 継続できるようにする。
   */
  const [
    aiError,
    setAiError,
  ] = useState<string | null>(
    null,
  );

  /**
   * Form Field共通更新処理。
   *
   * Genericを使うことで、
   * MeetingFormDataのField型を維持する。
   */
  const updateField = <
    K extends keyof MeetingFormData,
  >(
    field: K,
    value: MeetingFormData[K],
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
   * 最終的なData Validationは
   * Laravel FormRequest側で行う。
   *
   * Frontendでは入力時の使いやすさを目的として
   * 必須項目・数値範囲などを確認する。
   */
  const validate =
    (): MeetingFormErrors => {
      const nextErrors:
        MeetingFormErrors = {};

      /**
       * Meetingは必ずProjectへ所属する。
       */
      if (
        formData.projectId === ""
      ) {
        nextErrors.projectId =
          "案件を選択してください。";
      }

      /**
       * 商談名は必須。
       */
      if (
        formData.title.trim() === ""
      ) {
        nextErrors.title =
          "商談名を入力してください。";
      }

      /**
       * 商談予定日時は必須。
       */
      if (
        formData.scheduledAt === ""
      ) {
        nextErrors.scheduledAt =
          "商談予定日時を入力してください。";
      }

      /**
       * 所要時間が入力されている場合は、
       * Backendと同じ1〜1440分の範囲で確認する。
       */
      if (
        formData.durationMinutes
          .trim() !== ""
      ) {
        const duration =
          Number(
            formData.durationMinutes,
          );

        if (
          !Number.isInteger(
            duration,
          ) ||
          duration < 1 ||
          duration > 1440
        ) {
          nextErrors.durationMinutes =
            "所要時間は1〜1440分の整数で入力してください。";
        }
      }

      return nextErrors;
    };

  /**
   * Laravel 422 Validation Errorを
   * MeetingFormErrorsへ変換する。
   *
   * BackendでもFrontendと同じcamelCase、
   *
   * projectId
   * scheduledAt
   * durationMinutes
   * nextAction
   *
   * をRequest Fieldとして使用しているため、
   * Field名をそのまま対応させられる。
   */
  const mapApiValidationErrors = (
    error: ApiError,
  ): MeetingFormErrors => {
    const apiErrors:
      MeetingFormErrors = {};

    const fields =
      Object.keys(
        formData,
      ) as Array<
        keyof MeetingFormData
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
   * Meeting保存処理。
   *
   * create:
   *   POST /api/v1/meetings
   *
   * edit:
   *   PATCH /api/v1/meetings/{meeting}
   */
  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

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
        await createMeeting(
          formData,
        );

        /**
         * Meeting詳細専用Pageは
         * 現段階では作成しないため、
         * 登録後は一覧へ戻る。
         */
        router.push(
          "/meetings",
        );

        router.refresh();

        return;
      }

      if (
        meetingId === undefined
      ) {
        throw new Error(
          "商談IDが取得できません。",
        );
      }

      await updateMeeting(
        meetingId,
        formData,
      );

      router.push(
        "/meetings",
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
        "商談情報の保存に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 商談内容からAI提案を生成する。
   *
   * MeetingForm
   * ↓
   * suggestMeeting()
   * ↓
   * POST /api/v1/meeting-ai/suggest
   * ↓
   * OpenAI Responses API
   * ↓
   * result / nextAction
   * ↓
   * Formへ反映
   *
   * AI提案はこの時点ではDBへ保存しない。
   * Userが内容を確認・修正したあと、
   * 通常の保存処理を実行する。
   */
  const handleAiSuggest =
    async (): Promise<void> => {
      setAiError(null);

      /**
       * Backend AI Requestと同様、
       * AI提案には商談名と商談内容を必須とする。
       *
       * 通常のMeeting保存Validationとは
       * 独立して確認する。
       */
      const aiValidationErrors:
        MeetingFormErrors = {};

      if (
        formData.title.trim() === ""
      ) {
        aiValidationErrors.title =
          "AI提案には商談名の入力が必要です。";
      }

      if (
        formData.description.trim() === ""
      ) {
        aiValidationErrors.description =
          "AI提案には商談内容の入力が必要です。";
      }

      if (
        Object.keys(
          aiValidationErrors,
        ).length > 0
      ) {
        setErrors(
          (current) => ({
            ...current,
            ...aiValidationErrors,
          }),
        );

        setAiError(
          "AI提案に必要な項目を入力してください。",
        );

        return;
      }

      /**
       * 既存の結果・次回対応がある場合、
       * AI提案によって上書きされるため
       * Userへ事前確認する。
       */
      if (
        formData.result.trim() !== "" ||
        formData.nextAction.trim() !== ""
      ) {
        const confirmed =
          window.confirm(
            "現在の商談結果・次回対応をAI提案で置き換えますか？",
          );

        if (!confirmed) {
          return;
        }
      }

      setIsAiSuggesting(true);

      try {
        const suggestion =
          await suggestMeeting(
            formData,
          );

        /**
         * AI ResponseをFormへ反映するだけで、
         * DB保存は行わない。
         */
        setFormData(
          (current) => ({
            ...current,

            result:
              suggestion.result,

            nextAction:
              suggestion.nextAction,
          }),
        );

        /**
         * AI提案によって値が入るため、
         * result / nextActionのErrorを解除する。
         */
        setErrors(
          (current) => ({
            ...current,
            result: undefined,
            nextAction: undefined,
          }),
        );
      } catch (error) {
        if (
          error instanceof ApiError
        ) {
          setAiError(
            error.message,
          );

          return;
        }

        setAiError(
          "AI提案の生成に失敗しました。",
        );
      } finally {
        setIsAiSuggesting(false);
      }
    };

  /**
   * Meeting削除。
   *
   * 編集画面の場合だけ使用する。
   */
  const handleDelete =
    async (): Promise<void> => {
      if (
        mode !== "edit" ||
        meetingId === undefined
      ) {
        return;
      }

      /**
       * 誤操作防止のため、
       * Browser標準確認Dialogを表示する。
       */
      const confirmed =
        window.confirm(
          "この商談を削除しますか？",
        );

      if (!confirmed) {
        return;
      }

      setSubmitError(null);
      setIsDeleting(true);

      try {
        await deleteMeeting(
          meetingId,
        );

        router.push(
          "/meetings",
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
          "商談の削除に失敗しました。",
        );
      } finally {
        setIsDeleting(false);
      }
    };

  const disabled =
    isSubmitting ||
    isDeleting ||
    isAiSuggesting;

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/* ================================================
       * Meeting基本情報
       * ================================================ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            商談基本情報
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            案件・商談名・ステータス・商談方法を設定します。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Project */}
          <div className="md:col-span-2">
            <label
              htmlFor="meeting-project"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              案件

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <select
              id="meeting-project"
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

          {/* Meeting Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="meeting-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              商談名

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="meeting-title"
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
              placeholder="初回ヒアリング"
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
              htmlFor="meeting-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              ステータス
            </label>

            <select
              id="meeting-status"
              value={
                formData.status
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target
                    .value as MeetingFormData["status"],
                )
              }
              className={
                inputClassName
              }
            >
              <option value="scheduled">
                予定
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

          {/* Method */}
          <div>
            <label
              htmlFor="meeting-method"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              商談方法
            </label>

            <select
              id="meeting-method"
              value={
                formData.method
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "method",
                  event.target
                    .value as MeetingFormData["method"],
                )
              }
              className={
                inputClassName
              }
            >
              <option value="in_person">
                対面
              </option>

              <option value="online">
                オンライン
              </option>

              <option value="phone">
                電話
              </option>
            </select>

            {errors.method && (
              <p className="mt-1 text-sm text-red-600">
                {errors.method}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================================================
       * Meeting予定情報
       * ================================================ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            商談予定
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            商談日時・所要時間・場所を設定します。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Scheduled At */}
          <div>
            <label
              htmlFor="meeting-scheduled-at"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              商談予定日時

              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="meeting-scheduled-at"
              type="datetime-local"
              value={
                formData.scheduledAt
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "scheduledAt",
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            />

            {errors.scheduledAt && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.scheduledAt
                }
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="meeting-duration"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              所要時間（分）
            </label>

            <input
              id="meeting-duration"
              type="number"
              min={1}
              max={1440}
              step={1}
              value={
                formData.durationMinutes
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "durationMinutes",
                  event.target.value,
                )
              }
              placeholder="60"
              className={
                inputClassName
              }
            />

            {errors.durationMinutes && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.durationMinutes
                }
              </p>
            )}
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label
              htmlFor="meeting-location"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              場所・オンライン情報
            </label>

            <input
              id="meeting-location"
              type="text"
              value={
                formData.location
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value,
                )
              }
              placeholder="訪問先住所 / Google Meet / Microsoft Teams など"
              className={
                inputClassName
              }
            />

            {errors.location && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.location
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================================================
       * Meeting内容
       * ================================================ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            商談内容
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            商談前の確認事項や補足情報を入力します。
          </p>
        </div>

        <div className="mt-5">
          <label
            htmlFor="meeting-description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            内容・事前情報
          </label>

          <textarea
            id="meeting-description"
            rows={5}
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
            placeholder="商談で確認する内容や事前情報を入力してください。"
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

      {/* ================================================
       * Meeting結果・Next Action
       * ================================================ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              商談結果・次回対応
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              商談で決まった内容と次に行う対応を記録します。
            </p>

            <p className="mt-1 text-xs text-slate-400">
              AI提案は自動保存されません。内容を確認・修正してから保存してください。
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={
              handleAiSuggest
            }
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAiSuggesting ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Sparkles
                size={17}
              />
            )}

            {isAiSuggesting
              ? "AI提案を生成中..."
              : "AIで提案"}
          </button>
        </div>

        {aiError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {aiError}
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Result */}
          <div>
            <label
              htmlFor="meeting-result"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              商談結果
            </label>

            <textarea
              id="meeting-result"
              rows={5}
              value={
                formData.result
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "result",
                  event.target.value,
                )
              }
              placeholder="商談で決まった内容を入力してください。"
              className={
                inputClassName
              }
            />

            {errors.result && (
              <p className="mt-1 text-sm text-red-600">
                {errors.result}
              </p>
            )}
          </div>

          {/* Next Action */}
          <div>
            <label
              htmlFor="meeting-next-action"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              次回対応
            </label>

            <textarea
              id="meeting-next-action"
              rows={5}
              value={
                formData.nextAction
              }
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "nextAction",
                  event.target.value,
                )
              }
              placeholder="見積書送付、次回訪問日調整などを入力してください。"
              className={
                inputClassName
              }
            />

            {errors.nextAction && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.nextAction
                }
              </p>
            )}
          </div>
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
              disabled={disabled}
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
                : "商談を削除"}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            href="/meetings"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            キャンセル
          </Link>

          <button
            type="submit"
            disabled={disabled}
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
