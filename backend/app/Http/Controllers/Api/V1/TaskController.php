<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\IndexTaskRequest;
use App\Http\Requests\Api\V1\StoreTaskRequest;
use App\Http\Requests\Api\V1\UpdateTaskRequest;
use App\Http\Resources\Api\V1\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Task REST API Controller。
 *
 * Taskの、
 *
 * ・一覧
 * ・検索
 * ・絞り込み
 * ・登録
 * ・詳細
 * ・更新
 * ・削除
 *
 * を担当する。
 *
 * Validation:
 *   FormRequest
 *
 * DB操作:
 *   Task Model
 *
 * JSON変換:
 *   TaskResource
 *
 * へ責務を分離している。
 *
 * Task自身にはuser_idを持たせず、
 *
 * Task
 * ↓
 * Project
 * ↓
 * Customer
 * ↓
 * User
 *
 * のRelationから所有Userを判定する。
 */
class TaskController extends Controller
{
    /**
     * Task一覧。
     *
     * GET /api/v1/tasks
     */
    public function index(
        IndexTaskRequest $request,
    ): AnonymousResourceCollection {
        $validated =
            $request->validated();

        /**
         * Login Userが所有しているProjectに紐づく
         * Taskだけを取得対象にする。
         *
         * Task::query()だけでは、
         * 他User所有Taskまで取得できるため、
         *
         * Task
         * ↓
         * Project
         * ↓
         * Customer.user_id
         *
         * でScopeする。
         *
         * 一覧ではProject名・Customer名も表示するため、
         * RelationをEager Loadする。
         */
        $query = Task::query()
            ->whereHas(
                'project.customer',
                function ($customerQuery) use ($request): void {
                    $customerQuery->where(
                        'user_id',
                        $request->user()->id,
                    );
                },
            )
            ->with([
                'project:id,customer_id,name',
                'project.customer:id,name',
            ]);

        /**
         * Task名・Task詳細・Project名・Customer名検索。
         */
        $search = trim(
            (string) (
                $validated['search']
                ?? ''
            ),
        );

        if ($search !== '') {
            $keyword =
                mb_strtolower(
                    $search,
                );

            $query->where(
                function ($query) use (
                    $keyword,
                ): void {
                    /**
                     * Task名検索。
                     */
                    $query
                        ->whereRaw(
                            'LOWER(title) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )

                        /**
                         * Task詳細検索。
                         */
                        ->orWhereRaw(
                            'LOWER(description) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )

                        /**
                         * Project名検索。
                         */
                        ->orWhereHas(
                            'project',
                            function (
                                $projectQuery,
                            ) use (
                                $keyword,
                            ): void {
                                $projectQuery
                                    ->whereRaw(
                                        'LOWER(name) LIKE ?',
                                        [
                                            "%{$keyword}%",
                                        ],
                                    );
                            },
                        )

                        /**
                         * Customer名検索。
                         */
                        ->orWhereHas(
                            'project.customer',
                            function (
                                $customerQuery,
                            ) use (
                                $keyword,
                            ): void {
                                $customerQuery
                                    ->whereRaw(
                                        'LOWER(name) LIKE ?',
                                        [
                                            "%{$keyword}%",
                                        ],
                                    );
                            },
                        );
                },
            );
        }

        /**
         * Status Filter。
         */
        if (
            isset(
                $validated['status'],
            )
        ) {
            $query->where(
                'status',
                $validated['status'],
            );
        }

        /**
         * Priority Filter。
         */
        if (
            isset(
                $validated[
                    'priority'
                ],
            )
        ) {
            $query->where(
                'priority',
                $validated[
                    'priority'
                ],
            );
        }

        /**
         * Project Filter。
         *
         * Query全体がすでにLogin UserでScopeされているため、
         * 他UserのprojectIdを指定しても
         * Taskが返ることはない。
         */
        if (
            isset(
                $validated[
                    'projectId'
                ],
            )
        ) {
            $query->where(
                'project_id',
                $validated[
                    'projectId'
                ],
            );
        }

        /**
         * 1ページ20件をDefaultとする。
         *
         * 最大100件までという制御は
         * IndexTaskRequestで行う。
         */
        $perPage = (int) (
            $validated['perPage']
            ?? 20
        );

        /**
         * 新しいTaskから順番に取得する。
         */
        $tasks = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return TaskResource::collection(
            $tasks,
        );
    }

    /**
     * Task新規登録。
     *
     * POST /api/v1/tasks
     */
    public function store(
        StoreTaskRequest $request,
    ): JsonResponse {
        /**
         * projectIdがLogin User所有Projectであることは
         * StoreTaskRequestでValidation済み。
         */
        $attributes =
            $request->modelAttributes();

        /**
         * 新規作成時からcompletedの場合、
         * completed_atへ現在日時を記録する。
         *
         * completed_atはFrontendから直接入力させず、
         * Statusと同期してLaravel側で管理する。
         */
        if (
            $attributes['status']
            === 'completed'
        ) {
            $attributes['completed_at'] =
                now();
        }

        $task = Task::create(
            $attributes,
        );

        /**
         * ResponseへProject名・Customer名を含めるため、
         * Relationを読み込む。
         */
        $task->load([
            'project:id,customer_id,name',
            'project.customer:id,name',
        ]);

        /**
         * 新規Resource作成なので
         * HTTP 201 Created。
         */
        return (
            new TaskResource(
                $task,
            )
        )
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Task詳細。
     *
     * GET /api/v1/tasks/{task}
     *
     * 存在しないTask、
     * または他User所有Taskの場合は404。
     */
    public function show(
        Request $request,
        Task $task,
    ): TaskResource {
        $this->ensureTaskOwnedByUser(
            $request,
            $task,
        );

        $task->load([
            'project:id,customer_id,name',
            'project.customer:id,name',
        ]);

        return new TaskResource(
            $task,
        );
    }

    /**
     * Task更新。
     *
     * PUT/PATCH
     * /api/v1/tasks/{task}
     */
    public function update(
        UpdateTaskRequest $request,
        Task $task,
    ): TaskResource {
        /**
         * UpdateTaskRequestでもOwnership確認しているが、
         * Controller側でも防御的に確認する。
         */
        $this->ensureTaskOwnedByUser(
            $request,
            $task,
        );

        /**
         * PATCHの場合はRequestへ含まれた項目だけが
         * modelAttributes()へ設定される。
         */
        $attributes =
            $request->modelAttributes();

        /**
         * Status変更時にcompleted_atも同期する。
         *
         * completed:
         *   初めて完了になった時点で現在日時を設定。
         *
         * todo / in_progress / cancelled:
         *   完了状態ではないためcompleted_atをnullへ戻す。
         *
         * StatusがRequestに含まれていない場合は、
         * 既存completed_atを変更しない。
         */
        if (
            array_key_exists(
                'status',
                $attributes,
            )
        ) {
            if (
                $attributes['status']
                === 'completed'
            ) {
                /**
                 * 既に完了日時を持っている場合は、
                 * 他項目の更新によって完了日時が
                 * 毎回書き換わらないようにする。
                 */
                if (
                    $task->completed_at
                    === null
                ) {
                    $attributes['completed_at'] =
                        now();
                }
            } else {
                $attributes['completed_at'] =
                    null;
            }
        }

        $task->update(
            $attributes,
        );

        /**
         * 更新後の最新RelationをResponseへ含める。
         *
         * projectIdが変更されたケースでも、
         * 新しいProject / Customerを返せるよう
         * Relationを再読み込みする。
         */
        $task->load([
            'project:id,customer_id,name',
            'project.customer:id,name',
        ]);

        return new TaskResource(
            $task,
        );
    }

    /**
     * Task削除。
     *
     * DELETE /api/v1/tasks/{task}
     */
    public function destroy(
        Request $request,
        Task $task,
    ): Response {
        /**
         * 削除対象Taskが
         * Login User所有であることを確認する。
         */
        $this->ensureTaskOwnedByUser(
            $request,
            $task,
        );

        $task->delete();

        /**
         * 削除成功時はBodyなしの
         * HTTP 204 No Content。
         */
        return response()->noContent();
    }

    /**
     * TaskがLogin User所有か確認する。
     *
     * Task自身にはuser_idがないため、
     *
     * Task
     * ↓
     * Project
     * ↓
     * Customer
     * ↓
     * User
     *
     * とRelationをたどる。
     *
     * 他UserのTaskの場合は403ではなく404として扱い、
     * Resourceの存在そのものを公開しない。
     */
    private function ensureTaskOwnedByUser(
        Request $request,
        Task $task,
    ): void {
        $user =
            $request->user();

        /**
         * 通常はauth:sanctumによって
         * 未認証Userはここへ到達しない。
         *
         * 防御的にUserが取得できない場合は
         * 404として処理する。
         */
        if ($user === null) {
            abort(404);
        }

        $ownedByUser = $task
            ->project()
            ->whereHas(
                'customer',
                function ($customerQuery) use ($user): void {
                    $customerQuery->where(
                        'user_id',
                        $user->id,
                    );
                },
            )
            ->exists();

        if (! $ownedByUser) {
            abort(404);
        }
    }
}
