"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Customer, CustomerStatus } from "@/types/customer";

/**
 * CustomerListClientへ渡すProps。
 *
 * customersにはpage.tsx側から顧客一覧データを渡す。
 *
 * 現段階ではMockデータだが、
 * Laravel APIへ変更してもこのコンポーネント自体は
 * ほぼ変更せず利用できるようにする。
 */
type CustomerListClientProps = {
  customers: Customer[];
};

/**
 * ステータス絞り込みで使用する値。
 *
 * "all"はすべての顧客を意味する。
 * それ以外はCustomerStatusと同じ値を使用する。
 */
type StatusFilter = "all" | CustomerStatus;

/**
 * 1ページに表示する顧客数。
 *
 * データが増えた場合も、この数値を変更することで
 * ページ表示件数を調整できる。
 */
const ITEMS_PER_PAGE = 5;

/**
 * 顧客一覧画面の操作部分を担当するClient Component。
 *
 * 主な機能：
 *
 * ・キーワード検索
 * ・ステータス絞り込み
 * ・一覧表示
 * ・ページネーション
 * ・顧客詳細画面への遷移
 *
 * useStateを利用するため、
 * ファイル先頭に"use client"を指定している。
 */
export default function CustomerListClient({
  customers,
}: CustomerListClientProps) {
  /**
   * 検索欄へ入力された文字列を管理するState。
   */
  const [searchKeyword, setSearchKeyword] = useState("");

  /**
   * 顧客状態の絞り込み条件。
   *
   * 初期状態では全顧客を表示するため"all"にする。
   */
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  /**
   * 現在表示しているページ番号。
   */
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * 検索条件・ステータス条件に合う顧客だけを取得する。
   *
   * useMemoを使用することで、
   * customers・searchKeyword・statusFilterの値が
   * 変わった場合のみ絞り込み処理を再計算する。
   */
  const filteredCustomers = useMemo(() => {
    /**
     * 大文字・小文字の違いをなくすため、
     * 検索キーワードを小文字へ変換する。
     */
    const keyword = searchKeyword.trim().toLowerCase();

    return customers.filter((customer) => {
      /**
       * 会社名・担当者名・メールアドレスのいずれかに
       * 検索文字列が含まれているか確認する。
       */
      const matchesKeyword =
        keyword === "" ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.contactName.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword);

      /**
       * ステータス条件を確認する。
       *
       * allなら全件対象。
       */
      const matchesStatus =
        statusFilter === "all" ||
        customer.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [customers, searchKeyword, statusFilter]);

  /**
   * 絞り込み後のデータ件数から総ページ数を計算する。
   *
   * Math.max(1, ...) とすることで、
   * 検索結果が0件でもページ数が0にならないようにする。
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE),
  );

  /**
   * 現在ページの開始位置を計算する。
   *
   * 例：
   *
   * 1ページ目 → 0
   * 2ページ目 → 5
   * 3ページ目 → 10
   */
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  /**
   * 現在ページに表示する顧客だけを取り出す。
   */
  const visibleCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  /**
   * 検索キーワード変更時の処理。
   *
   * 検索条件が変わったら1ページ目へ戻す。
   */
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchKeyword(event.target.value);
    setCurrentPage(1);
  };

  /**
   * ステータス変更時の処理。
   *
   * selectのvalueはstringとして渡されるため、
   * StatusFilter型であることを明示する。
   */
  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(event.target.value as StatusFilter);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">

      {/* =====================================================
       * 検索・絞り込み
       * ===================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">

          {/* 顧客検索 */}
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchKeyword}
              onChange={handleSearchChange}
              placeholder="顧客名・担当者名・メールアドレスで検索"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* ステータス絞り込み */}
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">すべての顧客</option>
            <option value="active">取引中</option>
            <option value="inactive">取引停止</option>
          </select>
        </div>
      </div>


      {/* =====================================================
       * 顧客一覧
       * ===================================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* 件数表示 */}
        <div className="border-b border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {filteredCustomers.length}件の顧客
          </p>
        </div>

        {/*
         * PCではTable表示。
         *
         * 横幅が不足した場合でも
         * overflow-x-autoによって横スクロールできる。
         */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">

            {/* Table Header */}
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">
                  顧客名
                </th>

                <th className="px-6 py-4">
                  担当者
                </th>

                <th className="px-6 py-4">
                  メール
                </th>

                <th className="px-6 py-4">
                  電話番号
                </th>

                <th className="px-6 py-4 text-center">
                  案件数
                </th>

                <th className="px-6 py-4">
                  最終連絡日
                </th>

                <th className="px-6 py-4">
                  状態
                </th>

                <th className="px-6 py-4 text-right">
                  操作
                </th>
              </tr>
            </thead>


            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">

              {visibleCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition hover:bg-slate-50"
                >
                  {/* 顧客名 */}
                  <td className="px-6 py-5">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {customer.name}
                    </Link>
                  </td>

                  {/* 担当者 */}
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {customer.contactName}
                  </td>

                  {/* メール */}
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {customer.email}
                  </td>

                  {/* 電話番号 */}
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {customer.phone}
                  </td>

                  {/* 案件数 */}
                  <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                    {customer.projectCount}
                  </td>

                  {/* 最終連絡日 */}
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {customer.lastContactDate}
                  </td>

                  {/* ステータス */}
                  <td className="px-6 py-5">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",

                        customer.status === "active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {customer.status === "active"
                        ? "取引中"
                        : "取引停止"}
                    </span>
                  </td>

                  {/* 詳細画面 */}
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>


        {/* ===================================================
         * 検索結果0件
         * =================================================== */}
        {visibleCustomers.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-500">
              条件に一致する顧客がありません。
            </p>
          </div>
        )}


        {/* ===================================================
         * Pagination
         * =================================================== */}
        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-slate-500">
            {currentPage} / {totalPages} ページ
          </p>

          <div className="flex items-center gap-2">

            {/* 前ページ */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              前へ
            </button>

            {/* 次ページ */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1),
                )
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              次へ
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}