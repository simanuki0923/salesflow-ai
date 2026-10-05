<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\IndexProjectRequest;
use App\Http\Requests\Api\V1\StoreProjectRequest;
use App\Http\Requests\Api\V1\UpdateProjectRequest;
use App\Http\Resources\Api\V1\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Project REST API Controller。
 *
 * Projectの、
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
 *   Project Model
 *
 * JSON変換:
 *   ProjectResource
 *
 * へ責務を分離している。
 */
class ProjectController extends Controller
{
    /**
     * Project一覧。
     *
     * GET /api/v1/projects
     */
    public function index(
        IndexProjectRequest $request,
    ): AnonymousResourceCollection {
        $validated =
            $request->validated();

        /**
         * Project一覧では顧客名も使用するため、
         * customer RelationをEager Loadする。
         *
         * id/nameだけに絞って不要なColumnを
         * 取得しないようにする。
         */
        $query = Project::query()
            ->with([
                'customer:id,name',
            ]);

        /**
         * 案件名・顧客名検索。
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
                     * 案件名検索。
                     */
                    $query
                        ->whereRaw(
                            'LOWER(name) LIKE ?',
                            ["%{$keyword}%"],
                        )

                        /**
                         * Customer Relationを使って
                         * 顧客名も検索する。
                         */
                        ->orWhereHas(
                            'customer',
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
         * Customer Filter。
         *
         * 顧客詳細画面から、
         * その顧客の案件だけ取得する場合にも利用可能。
         */
        if (
            isset(
                $validated[
                    'customerId'
                ],
            )
        ) {
            $query->where(
                'customer_id',
                $validated[
                    'customerId'
                ],
            );
        }

        /**
         * デフォルト20件。
         *
         * 最大100件という制御は
         * IndexProjectRequestで行っている。
         */
        $perPage = (int) (
            $validated['perPage']
            ?? 20
        );

        /**
         * 新しいProjectから順に取得する。
         */
        $projects = $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return ProjectResource::collection(
            $projects,
        );
    }

    /**
     * Project新規登録。
     *
     * POST /api/v1/projects
     */
    public function store(
        StoreProjectRequest $request,
    ): JsonResponse {
        /**
         * Validation済みデータを
         * Project Modelへ登録する。
         */
        $project = Project::create(
            $request->modelAttributes(),
        );

        /**
         * ResponseでcustomerNameを返すため
         * Customer Relationを読み込む。
         */
        $project->load([
            'customer:id,name',
        ]);

        /**
         * 新規Resource作成なので
         * HTTP 201 Created。
         */
        return (
            new ProjectResource(
                $project,
            )
        )
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Project詳細。
     *
     * GET /api/v1/projects/{project}
     *
     * Route Model Bindingにより
     * IDからProject Modelが自動取得される。
     *
     * 存在しないIDならLaravelが404を返す。
     */
    public function show(
        Project $project,
    ): ProjectResource {
        $project->load([
            'customer:id,name',
        ]);

        return new ProjectResource(
            $project,
        );
    }

    /**
     * Project更新。
     *
     * PUT/PATCH
     * /api/v1/projects/{project}
     */
    public function update(
        UpdateProjectRequest $request,
        Project $project,
    ): ProjectResource {
        /**
         * PATCHの場合はRequestに存在する項目だけ
         * modelAttributes()へ含まれる。
         */
        $project->update(
            $request->modelAttributes(),
        );

        /**
         * DBの最新状態を再取得する。
         */
        $project->refresh();

        /**
         * 顧客が変更された場合にも
         * 最新customerNameを返す。
         */
        $project->load([
            'customer:id,name',
        ]);

        return new ProjectResource(
            $project,
        );
    }

    /**
     * Project削除。
     *
     * DELETE /api/v1/projects/{project}
     */
    public function destroy(
        Project $project,
    ): Response {
        $project->delete();

        /**
         * 削除成功時はResponse Bodyを返さない。
         *
         * HTTP 204 No Content。
         */
        return response()->noContent();
    }
}
