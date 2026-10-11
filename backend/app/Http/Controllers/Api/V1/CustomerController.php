<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\IndexCustomerRequest;
use App\Http\Requests\Api\V1\StoreCustomerRequest;
use App\Http\Requests\Api\V1\UpdateCustomerRequest;
use App\Http\Resources\Api\V1\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Customer REST API Controller。
 *
 * Customerの、
 *
 * ・一覧
 * ・登録
 * ・詳細
 * ・更新
 * ・削除
 *
 * を担当する。
 *
 * ValidationはFormRequest、
 * JSON変換はCustomerResourceへ分離している。
 *
 * また、すべてのCustomer操作は
 * Login User自身が所有するCustomerだけを対象とする。
 */
class CustomerController extends Controller
{
    /**
     * Customer一覧。
     *
     * GET /api/v1/customers
     */
    public function index(
        IndexCustomerRequest $request,
    ): AnonymousResourceCollection {
        $validated = $request->validated();

        /**
         * Login User自身が所有するCustomerだけを
         * Query対象にする。
         *
         * Customer::query()を直接使用すると、
         * 他UserのCustomerまで取得できてしまうため、
         * User -> customers() Relationを起点にする。
         *
         * projectCountも同時に取得する。
         *
         * projects本体を読み込むのではなく、
         * COUNTだけ取得するため効率がよい。
         */
        $query = $request
            ->user()
            ->customers()
            ->withCount('projects');

        /**
         * 顧客名・担当者・メール検索。
         *
         * LOWER + LIKEにすることで、
         * PostgreSQLだけでなくTest用SQLiteでも
         * 動作しやすい検索方法にしている。
         */
        $search = trim(
            (string) (
                $validated['search'] ?? ''
            ),
        );

        if ($search !== '') {
            $keyword = mb_strtolower(
                $search,
            );

            $query->where(
                function ($query) use ($keyword): void {
                    $query
                        ->whereRaw(
                            'LOWER(name) LIKE ?',
                            ["%{$keyword}%"],
                        )
                        ->orWhereRaw(
                            'LOWER(contact_name) LIKE ?',
                            ["%{$keyword}%"],
                        )
                        ->orWhereRaw(
                            'LOWER(email) LIKE ?',
                            ["%{$keyword}%"],
                        );
                },
            );
        }

        /**
         * statusが指定された場合のみFilter。
         *
         * active / inactive以外は
         * IndexCustomerRequestで422になる。
         */
        if (
            isset($validated['status'])
        ) {
            $query->where(
                'status',
                $validated['status'],
            );
        }

        /**
         * 1ページの最大件数は
         * Request側で100までに制限している。
         */
        $perPage = (int) (
            $validated['perPage'] ?? 20
        );

        /**
         * 新しく登録されたCustomerから表示する。
         *
         * paginate()により、
         *
         * data
         * links
         * meta
         *
         * を持つPagination Responseになる。
         */
        $customers = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return CustomerResource::collection(
            $customers,
        );
    }

    /**
     * Customer新規登録。
     *
     * POST /api/v1/customers
     */
    public function store(
        StoreCustomerRequest $request,
    ): JsonResponse {
        /**
         * Validation済みのForm Dataを
         * Database用のsnake_caseへ変換する。
         */
        $attributes = $request->modelAttributes();

        /**
         * Customerの所有者はFrontendから受け取らない。
         *
         * auth:sanctumで認証されたLogin Userを
         * Laravel側でuser_idへ設定する。
         *
         * これによりFrontendから別Userのuser_idを送信して
         * Customerを作成することを防止する。
         */
        $attributes['user_id'] = $request->user()->id;

        $customer = Customer::create(
            $attributes,
        );

        /**
         * ResourceのprojectCount用。
         *
         * 新規登録直後なので通常0件になる。
         */
        $customer->loadCount(
            'projects',
        );

        /**
         * 新規作成成功なので
         * HTTP 201 Createdを返す。
         */
        return (
            new CustomerResource(
                $customer,
            )
        )
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Customer詳細。
     *
     * GET /api/v1/customers/{customer}
     *
     * Route Model Bindingによって、
     * URLのcustomer IDからCustomer Modelが
     * 自動取得される。
     *
     * Customerが存在しない場合、
     * Laravelが404を返す。
     *
     * Customerが存在していても
     * Login User所有でなければ404を返す。
     */
    public function show(
        Request $request,
        Customer $customer,
    ): CustomerResource {
        $this->ensureCustomerOwnedByUser(
            $request,
            $customer,
        );

        $customer->loadCount(
            'projects',
        );

        return new CustomerResource(
            $customer,
        );
    }

    /**
     * Customer更新。
     *
     * PUT/PATCH
     * /api/v1/customers/{customer}
     */
    public function update(
        UpdateCustomerRequest $request,
        Customer $customer,
    ): CustomerResource {
        /**
         * Login User自身のCustomerであることを
         * 更新前に確認する。
         */
        $this->ensureCustomerOwnedByUser(
            $request,
            $customer,
        );

        /**
         * PATCHの場合はRequestへ送られた項目だけが
         * modelAttributes()から返る。
         *
         * user_idはUpdateCustomerRequestから受け取らないため、
         * Customerの所有者が更新されることはない。
         */
        $customer->update(
            $request->modelAttributes(),
        );

        /**
         * DB最新状態を再取得する。
         */
        $customer->refresh();

        $customer->loadCount(
            'projects',
        );

        return new CustomerResource(
            $customer,
        );
    }

    /**
     * Customer削除。
     *
     * DELETE /api/v1/customers/{customer}
     */
    public function destroy(
        Request $request,
        Customer $customer,
    ): JsonResponse|Response {
        /**
         * Login User自身のCustomerだけ削除可能にする。
         */
        $this->ensureCustomerOwnedByUser(
            $request,
            $customer,
        );

        /**
         * Projectが存在するCustomerを削除すると、
         * Projectが紐付くCustomerを失ってしまう。
         *
         * DB側にもrestrictOnDeleteがあるが、
         * API側でも事前確認し、
         * 分かりやすい409 Responseを返す。
         */
        if (
            $customer
                ->projects()
                ->exists()
        ) {
            return response()->json(
                [
                    'message' => '案件が存在する顧客は削除できません。',
                ],
                409,
            );
        }

        $customer->delete();

        /**
         * DELETE成功時はResponse Bodyなしの
         * HTTP 204 No Content。
         */
        return response()->noContent();
    }

    /**
     * 指定されたCustomerが
     * Login User自身の所有データか確認する。
     *
     * 他UserのCustomerだった場合は403ではなく404を返す。
     *
     * 403にすると、
     *
     * 「そのIDのCustomerは存在する」
     *
     * という情報を別Userへ伝えてしまうため、
     * SalesFlow AIでは存在しない場合と同じ404として扱う。
     */
    private function ensureCustomerOwnedByUser(
        Request $request,
        Customer $customer,
    ): void {
        if (
            (int) $customer->user_id !==
            (int) $request->user()->id
        ) {
            abort(404);
        }
    }
}
