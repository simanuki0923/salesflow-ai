"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import {
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  ApiError,
} from "@/lib/api/client";

import {
  createCustomer,
  updateCustomer,
} from "@/lib/api/customers";

import type {
  CustomerFormData,
  CustomerFormErrors,
  CustomerFormMode,
} from "@/types/customer";

/**
 * CustomerForm Props。
 *
 * create:
 *   customerId / initialData不要
 *
 * edit:
 *   customerId / initialDataを使用
 */
type CustomerFormProps = {
  mode: CustomerFormMode;

  customerId?: number;

  initialData?: CustomerFormData;
};

/**
 * 新規登録時の初期値。
 *
 * HTML Formではnullより空文字の方が
 * controlled inputとして扱いやすい。
 */
const emptyFormData:
  CustomerFormData = {
  name: "",
  nameKana: "",
  contactName: "",
  contactNameKana: "",
  email: "",
  phone: "",
  postalCode: "",
  address: "",
  industry: "",
  website: "",
  status: "active",
  memo: "",
};

/**
 * Customer登録・編集共通Form。
 */
export default function CustomerForm({
  mode,
  customerId,
  initialData,
}: CustomerFormProps) {
  const router =
    useRouter();

  /**
   * initialDataが存在すれば編集。
   * なければ新規登録用空データ。
   */
  const [
    formData,
    setFormData,
  ] = useState<CustomerFormData>(
    initialData ??
      emptyFormData,
  );

  /**
   * 各FieldのValidation Error。
   */
  const [
    errors,
    setErrors,
  ] = useState<CustomerFormErrors>(
    {},
  );

  /**
   * Laravel API Errorなど、
   * Form全体に関するError。
   */
  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  );

  /**
   * 二重Submitを防ぐ。
   */
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /**
   * Genericを使うことで、
   *
   * nameにはstring
   * statusにはCustomerStatus
   *
   * という型関係を維持したまま更新できる。
   */
  const updateField = <
    K extends keyof CustomerFormData,
  >(
    field: K,
    value: CustomerFormData[K],
  ) => {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    /**
     * 入力を修正したFieldのErrorだけ解除する。
     */
    setErrors(
      (current) => ({
        ...current,
        [field]: undefined,
      }),
    );
  };

  /**
   * Browser側の簡易Validation。
   *
   * Laravel側でも同じ内容をValidationするため、
   * Client Validationだけを信用しているわけではない。
   *
   * Frontend:
   *   入力しやすさ
   *
   * Backend:
   *   データ整合性・Security
   */
  const validate =
    (): CustomerFormErrors => {
      const nextErrors:
        CustomerFormErrors = {};

      if (
        formData.name.trim() === ""
      ) {
        nextErrors.name =
          "顧客名を入力してください。";
      }

      if (
        formData
          .contactName
          .trim() === ""
      ) {
        nextErrors.contactName =
          "担当者名を入力してください。";
      }

      if (
        formData.email.trim() === ""
      ) {
        nextErrors.email =
          "メールアドレスを入力してください。";
      } else {
        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
          !emailPattern.test(
            formData.email,
          )
        ) {
          nextErrors.email =
            "正しいメールアドレスを入力してください。";
        }
      }

      return nextErrors;
    };

  /**
   * Laravel Validation Errorを、
   * CustomerFormErrorsへ変換する。
   */
  const mapApiErrors = (
    error: ApiError,
  ): CustomerFormErrors => {
    const apiErrors:
      CustomerFormErrors = {};

    const fields =
      Object.keys(
        formData,
      ) as Array<
        keyof CustomerFormData
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
   * Form Submit。
   *
   * create:
   * POST /api/v1/customers
   *
   * edit:
   * PATCH /api/v1/customers/{id}
   */
  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
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
        const createdCustomer =
          await createCustomer(
            formData,
          );

        /**
         * 登録成功後は、
         * 新しく発行されたIDの詳細画面へ移動する。
         */
        router.push(
          `/customers/${createdCustomer.id}`,
        );

        router.refresh();

        return;
      }

      if (
        customerId === undefined
      ) {
        throw new Error(
          "顧客IDが取得できません。",
        );
      }

      await updateCustomer(
        customerId,
        formData,
      );

      /**
       * 更新後は詳細画面へ戻る。
       */
      router.push(
        `/customers/${customerId}`,
      );

      router.refresh();
    } catch (error) {
      if (
        error instanceof ApiError
      ) {
        /**
         * Laravelの422 Validation Errorを
         * 各inputへ表示する。
         */
        setErrors(
          (current) => ({
            ...current,
            ...mapApiErrors(
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
        "顧客情報の保存に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel先。
   */
  const cancelHref =
    mode === "edit" &&
    customerId !== undefined
      ? `/customers/${customerId}`
      : "/customers";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* 基本情報 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            基本情報
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            顧客の基本情報を入力してください。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* 顧客名 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              顧客名
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="株式会社ABC"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* 顧客名カナ */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              顧客名カナ
            </label>

            <input
              type="text"
              value={
                formData.nameKana
              }
              onChange={(event) =>
                updateField(
                  "nameKana",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="カブシキガイシャエービーシー"
            />
          </div>

          {/* 担当者 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              担当者名
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={
                formData.contactName
              }
              onChange={(event) =>
                updateField(
                  "contactName",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="山田 太郎"
            />

            {errors.contactName && (
              <p className="mt-1 text-sm text-red-600">
                {
                  errors.contactName
                }
              </p>
            )}
          </div>

          {/* 担当者カナ */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              担当者名カナ
            </label>

            <input
              type="text"
              value={
                formData
                  .contactNameKana
              }
              onChange={(event) =>
                updateField(
                  "contactNameKana",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="ヤマダ タロウ"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              メールアドレス
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              type="email"
              value={
                formData.email
              }
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="example@example.com"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* 電話番号 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              電話番号
            </label>

            <input
              type="tel"
              value={
                formData.phone
              }
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="03-1234-5678"
            />
          </div>

          {/* 郵便番号 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              郵便番号
            </label>

            <input
              type="text"
              value={
                formData.postalCode
              }
              onChange={(event) =>
                updateField(
                  "postalCode",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="100-0001"
            />
          </div>

          {/* 業種 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              業種
            </label>

            <input
              type="text"
              value={
                formData.industry
              }
              onChange={(event) =>
                updateField(
                  "industry",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="IT・システム開発"
            />
          </div>

          {/* 住所 */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              住所
            </label>

            <input
              type="text"
              value={
                formData.address
              }
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="東京都千代田区..."
            />
          </div>

          {/* Webサイト */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Webサイト
            </label>

            <input
              type="url"
              value={
                formData.website
              }
              onChange={(event) =>
                updateField(
                  "website",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="https://example.com"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              ステータス
            </label>

            <select
              value={
                formData.status
              }
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as
                    CustomerFormData["status"],
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="active">
                取引中
              </option>

              <option value="inactive">
                取引停止
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* メモ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          メモ
        </label>

        <textarea
          rows={5}
          value={formData.memo}
          onChange={(event) =>
            updateField(
              "memo",
              event.target.value,
            )
          }
          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="顧客に関する補足情報を入力してください。"
        />
      </section>

      {/* API Error */}
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {submitError}
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-end gap-3">
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          キャンセル
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />

          {isSubmitting
            ? "保存中..."
            : mode === "create"
              ? "顧客を登録"
              : "変更を保存"}
        </button>
      </div>
    </form>
  );
}