import CustomerForm
  from "@/components/customers/CustomerForm";

/**
 * Customer新規登録ページ。
 *
 * 実際のPOST処理は
 * Client ComponentであるCustomerFormが担当する。
 */
export default function CustomerCreatePage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          新規顧客登録
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          新しい顧客情報を登録します。
        </p>
      </section>

      <CustomerForm
        mode="create"
      />
    </div>
  );
}