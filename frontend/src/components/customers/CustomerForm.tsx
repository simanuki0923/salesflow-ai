"use client";

import Link from "next/link";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

import {
  FormEvent,
  type ReactNode,
  useState,
} from "react";

import type {
  CustomerFormData,
  CustomerFormErrors,
  CustomerFormMode,
} from "@/types/customer";

/**
 * CustomerFormへ渡すProps。
 *
 * mode:
 *   新規登録か編集かを判定する。
 *
 * customerId:
 *   編集画面の場合のみ使用する。
 *
 * initialData:
 *   編集画面で既存データをフォームへ表示するために使用する。
 */
type CustomerFormProps = {
  mode: CustomerFormMode;
  customerId?: number;
  initialData?: CustomerFormData;
};

/**
 * 新規登録時に使用する初期値。
 *
 * 入力欄をundefinedにせず、
 * 最初から空文字を設定してControlled Componentとして扱う。
 */
const emptyFormData: CustomerFormData = {
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
 * 顧客登録・編集共通フォーム。
 *
 * 現段階ではLaravel APIには送信せず、
 *
 * ・入力値管理
 * ・TypeScriptによる型制御
 * ・入力チェック
 * ・エラー表示
 *
 * まで実装する。
 *
 * Laravel API完成後、
 * handleSubmit内へAPI通信処理を追加する予定。
 */
export default function CustomerForm({
  mode,
  customerId,
  initialData,
}: CustomerFormProps) {
  /**
   * フォーム全体の入力値を管理するState。
   *
   * 編集の場合：
   * initialData
   *
   * 新規登録の場合：
   * emptyFormData
   *
   * を初期値として使用する。
   */
  const [formData, setFormData] = useState<CustomerFormData>(
    initialData ?? emptyFormData,
  );

  /**
   * 各入力項目のValidationエラーを管理する。
   */
  const [errors, setErrors] =
    useState<CustomerFormErrors>({});

  /**
   * 送信確認用メッセージ。
   *
   * 現段階ではLaravel API未接続のため、
   * Validation成功を画面上で確認する用途で使用する。
   */
  const [submitMessage, setSubmitMessage] =
    useState<string | null>(null);

  /**
   * フォームの任意の項目を安全に更新する関数。
   *
   * K extends keyof CustomerFormData
   *
   * とすることで、
   * CustomerFormDataに存在する項目名だけを受け付ける。
   *
   * さらにvalueも各項目に対応した型になる。
   */
  const updateField = <K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    /**
     * 入力し直した項目のエラー表示を解除する。
     */
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    /**
     * 入力内容が変更されたら
     * 前回の送信成功メッセージを消す。
     */
    setSubmitMessage(null);
  };

  /**
   * フォーム全体をValidationする。
   *
   * エラーがある場合は
   * CustomerFormErrorsとして返す。
   */
  const validate = (): CustomerFormErrors => {
    const newErrors: CustomerFormErrors = {};

    /**
     * 顧客名は必須。
     */
    if (formData.name.trim() === "") {
      newErrors.name =
        "顧客名を入力してください。";
    }

    /**
     * 担当者名も必須。
     */
    if (formData.contactName.trim() === "") {
      newErrors.contactName =
        "担当者名を入力してください。";
    }

    /**
     * メールアドレスは必須。
     */
    if (formData.email.trim() === "") {
      newErrors.email =
        "メールアドレスを入力してください。";
    } else {
      /**
       * 最低限のメール形式チェック。
       *
       * 本格的なValidationは後ほどLaravel側でも実施する。
       */
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formData.email)) {
        newErrors.email =
          "メールアドレスの形式が正しくありません。";
      }
    }

    return newErrors;
  };

  /**
   * フォーム送信処理。
   *
   * 現段階ではLaravel APIを呼ばず、
   * Validationが成功したことだけ確認する。
   */
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    /**
     * HTMLフォーム本来の画面再読み込みを防ぐ。
     */
    event.preventDefault();

    const validationErrors = validate();

    /**
     * ValidationエラーをStateへ保存する。
     */
    setErrors(validationErrors);

    /**
     * エラーが1件でもあれば送信処理を中断する。
     */
    if (
      Object.keys(validationErrors).length > 0
    ) {
      setSubmitMessage(null);
      return;
    }

    /**
     * Laravel API実装後は、
     *
     * create:
     * POST /api/v1/customers
     *
     * edit:
     * PUT /api/v1/customers/{id}
     *
     * をここから呼び出す。
     */
    if (mode === "create") {
      setSubmitMessage(
        "入力内容を確認しました。API接続後はここで顧客を登録します。",
      );
    } else {
      setSubmitMessage(
        "入力内容を確認しました。API接続後はここで顧客情報を更新します。",
      );
    }
  };

  /**
   * 新規登録と編集でキャンセル先を変更する。
   */
  const cancelHref =
    mode === "edit" && customerId
      ? `/customers/${customerId}`
      : "/customers";

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

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              基本情報
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              顧客・会社に関する基本情報を入力します。
            </p>
          </div>
        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* 顧客名 */}
          <FormField
            label="顧客名"
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
              placeholder="例：株式会社ABC"
              className={inputClass(errors.name)}
            />
          </FormField>


          {/* 顧客名カナ */}
          <FormField label="顧客名カナ">
            <input
              type="text"
              value={formData.nameKana}
              onChange={(event) =>
                updateField(
                  "nameKana",
                  event.target.value,
                )
              }
              placeholder="例：カブシキガイシャエービーシー"
              className={inputClass()}
            />
          </FormField>


          {/* 業種 */}
          <FormField label="業種">
            <input
              type="text"
              value={formData.industry}
              onChange={(event) =>
                updateField(
                  "industry",
                  event.target.value,
                )
              }
              placeholder="例：Web・IT"
              className={inputClass()}
            />
          </FormField>


          {/* 取引状態 */}
          <FormField label="取引状態">
            <select
              value={formData.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value === "inactive"
                    ? "inactive"
                    : "active",
                )
              }
              className={inputClass()}
            >
              <option value="active">
                取引中
              </option>

              <option value="inactive">
                取引停止
              </option>
            </select>
          </FormField>

        </div>
      </section>


      {/* =====================================================
       * 担当者・連絡先
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <User size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              担当者・連絡先
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              主な連絡先となる担当者情報を入力します。
            </p>
          </div>
        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* 担当者 */}
          <FormField
            label="担当者名"
            required
            error={errors.contactName}
          >
            <input
              type="text"
              value={formData.contactName}
              onChange={(event) =>
                updateField(
                  "contactName",
                  event.target.value,
                )
              }
              placeholder="例：山田 太郎"
              className={inputClass(
                errors.contactName,
              )}
            />
          </FormField>


          {/* 担当者カナ */}
          <FormField label="担当者名カナ">
            <input
              type="text"
              value={formData.contactNameKana}
              onChange={(event) =>
                updateField(
                  "contactNameKana",
                  event.target.value,
                )
              }
              placeholder="例：ヤマダ タロウ"
              className={inputClass()}
            />
          </FormField>


          {/* Email */}
          <FormField
            label="メールアドレス"
            required
            error={errors.email}
          >
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="example@example.com"
                className={`${inputClass(
                  errors.email,
                )} pl-11`}
              />
            </div>
          </FormField>


          {/* 電話 */}
          <FormField label="電話番号">
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value,
                  )
                }
                placeholder="03-1234-5678"
                className={`${inputClass()} pl-11`}
              />
            </div>
          </FormField>

        </div>
      </section>


      {/* =====================================================
       * 所在地・Web
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              所在地・Web
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              住所やWebサイト情報を入力します。
            </p>
          </div>
        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* 郵便番号 */}
          <FormField label="郵便番号">
            <input
              type="text"
              value={formData.postalCode}
              onChange={(event) =>
                updateField(
                  "postalCode",
                  event.target.value,
                )
              }
              placeholder="100-0001"
              className={inputClass()}
            />
          </FormField>


          {/* 住所 */}
          <FormField label="住所">
            <input
              type="text"
              value={formData.address}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value,
                )
              }
              placeholder="東京都千代田区..."
              className={inputClass()}
            />
          </FormField>


          {/* Webサイト */}
          <div className="md:col-span-2">
            <FormField label="Webサイト">
              <input
                type="url"
                value={formData.website}
                onChange={(event) =>
                  updateField(
                    "website",
                    event.target.value,
                  )
                }
                placeholder="https://example.com"
                className={inputClass()}
              />
            </FormField>
          </div>

        </div>
      </section>


      {/* =====================================================
       * メモ
       * ===================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          メモ
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          顧客に関する補足事項を入力できます。
        </p>

        <textarea
          value={formData.memo}
          onChange={(event) =>
            updateField(
              "memo",
              event.target.value,
            )
          }
          rows={6}
          placeholder="顧客に関するメモを入力してください。"
          className="mt-5 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </section>


      {/* =====================================================
       * Validation成功メッセージ
       * ===================================================== */}
      {submitMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {submitMessage}
        </div>
      )}


      {/* =====================================================
       * 操作ボタン
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
            ? "顧客を登録"
            : "変更を保存"}
        </button>

      </div>
    </form>
  );
}


/**
 * フォーム項目共通UI。
 *
 * label・必須表示・エラー表示を共通化する。
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
 * input/selectへ適用する共通Tailwind CSS。
 *
 * Validationエラーがある場合だけ
 * BorderとFocus色を赤へ変更する。
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