<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\IndexMeetingRequest;
use App\Http\Requests\Api\V1\StoreMeetingRequest;
use App\Http\Requests\Api\V1\UpdateMeetingRequest;
use App\Http\Resources\Api\V1\MeetingResource;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Meeting REST API Controller。
 *
 * Meetingの、
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
 *   Meeting Model
 *
 * JSON変換:
 *   MeetingResource
 *
 * へ責務を分離する。
 *
 * Meeting自身にはuser_idを持たせず、
 *
 * Meeting
 * ↓
 * Project
 * ↓
 * Customer
 * ↓
 * User
 *
 * のRelationから所有Userを判定する。
 */
class MeetingController extends Controller
{
    /**
     * Meeting一覧。
     *
     * GET /api/v1/meetings
     */
    public function index(
        IndexMeetingRequest $request,
    ): AnonymousResourceCollection {
        $validated =
            $request->validated();

        /**
         * Login User所有Projectに紐づく
         * Meetingだけを取得対象にする。
         *
         * 一覧画面でProject名・Customer名も
         * 使用するためRelationをEager Loadする。
         */
        $query = Meeting::query()
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
         * Keyword検索。
         *
         * 検索対象：
         *
         * ・Meeting名
         * ・Meeting詳細
         * ・場所
         * ・商談結果
         * ・次回対応
         * ・Project名
         * ・Customer名
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
                    $query
                        ->whereRaw(
                            'LOWER(title) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )
                        ->orWhereRaw(
                            'LOWER(description) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )
                        ->orWhereRaw(
                            'LOWER(location) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )
                        ->orWhereRaw(
                            'LOWER(result) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )
                        ->orWhereRaw(
                            'LOWER(next_action) LIKE ?',
                            [
                                "%{$keyword}%",
                            ],
                        )
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
         * Method Filter。
         */
        if (
            isset(
                $validated['method'],
            )
        ) {
            $query->where(
                'method',
                $validated['method'],
            );
        }

        /**
         * Project Filter。
         *
         * Query全体をLogin User所有Dataへ
         * Scopeしているため、
         * 他UserのprojectIdを指定しても
         * Meetingは返らない。
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
         * Defaultは1ページ20件。
         *
         * 最大100件の制御は
         * IndexMeetingRequestで行う。
         */
        $perPage = (int) (
            $validated['perPage']
            ?? 20
        );

        /**
         * 商談予定日時の新しい順に取得する。
         *
         * 同一日時の場合はidの降順で
         * 表示順を安定させる。
         */
        $meetings = $query
            ->orderByDesc(
                'scheduled_at',
            )
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return MeetingResource::collection(
            $meetings,
        );
    }

    /**
     * Meeting新規登録。
     *
     * POST /api/v1/meetings
     */
    public function store(
        StoreMeetingRequest $request,
    ): JsonResponse {
        /**
         * projectIdのOwnershipは
         * StoreMeetingRequestでValidation済み。
         */
        $attributes =
            $request->modelAttributes();

        /**
         * 新規登録時からcompletedの場合、
         * completed_atへ現在日時を設定する。
         *
         * completed_atはFrontendから直接送信せず、
         * Statusと同期してBackend側で管理する。
         */
        if (
            $attributes['status']
            === 'completed'
        ) {
            $attributes['completed_at'] =
                now();
        }

        $meeting = Meeting::create(
            $attributes,
        );

        /**
         * ResponseへProject名・Customer名を
         * 含めるためRelationを読み込む。
         */
        $meeting->load([
            'project:id,customer_id,name',
            'project.customer:id,name',
        ]);

        return (
            new MeetingResource(
                $meeting,
            )
        )
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Meeting詳細。
     *
     * GET /api/v1/meetings/{meeting}
     *
     * 他User所有Meetingの場合は
     * 存在情報を公開せず404を返す。
     */
    public function show(
        Request $request,
        Meeting $meeting,
    ): MeetingResource {
        $this->ensureMeetingOwnedByUser(
            $request,
            $meeting,
        );

        $meeting->load([
            'project:id,customer_id,name',
            'project.customer:id,name',
        ]);

        return new MeetingResource(
            $meeting,
        );
    }

    /**
     * Meeting更新。
     *
     * PUT/PATCH
     * /api/v1/meetings/{meeting}
     */
    public function update(
        UpdateMeetingRequest $request,
        Meeting $meeting,
    ): MeetingResource {
        /**
         * UpdateMeetingRequestでもOwnership確認を行うが、
         * Controller側でも防御的に確認する。
         */
        $this->ensureMeetingOwnedByUser(
            $request,
            $meeting,
        );

        /**
         * PATCHの場合は送信された項目だけが
         * modelAttributes()へ設定される。
         */
        $attributes =
            $request->modelAttributes();

        /**
         * Statusとcompleted_atを同期する。
         *
         * completed:
         *   未設定の場合だけ現在日時を設定。
         *
         * scheduled / cancelled:
         *   completed_atをnullへ戻す。
         *
         * Status未送信:
         *   completed_atを変更しない。
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
                if (
                    $meeting->completed_at
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

        $meeting->update(
            $attributes,
        );

        /**
         * projectId変更にも対応できるよう、
         * 更新後のRelationを再読み込みする。
         */
        $meeting->load([
            'project:id,customer_id,name',
            'project.customer:id,name',
        ]);

        return new MeetingResource(
            $meeting,
        );
    }

    /**
     * Meeting削除。
     *
     * DELETE /api/v1/meetings/{meeting}
     */
    public function destroy(
        Request $request,
        Meeting $meeting,
    ): Response {
        $this->ensureMeetingOwnedByUser(
            $request,
            $meeting,
        );

        $meeting->delete();

        return response()->noContent();
    }

    /**
     * MeetingがLogin User所有Dataか確認する。
     *
     * Meeting自身にはuser_idがないため、
     *
     * Meeting
     * ↓
     * Project
     * ↓
     * Customer
     * ↓
     * User
     *
     * のRelationを利用する。
     *
     * 他User所有Meetingの場合は、
     * Dataの存在情報を公開しないため404を返す。
     */
    private function ensureMeetingOwnedByUser(
        Request $request,
        Meeting $meeting,
    ): void {
        $user =
            $request->user();

        if ($user === null) {
            abort(401);
        }

        $ownedByUser = $meeting
            ->project()
            ->whereHas(
                'customer',
                function ($query) use ($user): void {
                    $query->where(
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
