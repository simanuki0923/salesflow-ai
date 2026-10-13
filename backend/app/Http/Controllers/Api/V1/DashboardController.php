<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Dashboard API Controller。
 *
 * Login Userが所有する、
 *
 * ・Customer数
 * ・Project数
 * ・進行中Project数
 * ・Project総額
 * ・Project Status別件数
 * ・最近のProject
 * ・期限が近いProject
 *
 * をDashboard表示用にまとめて返す。
 *
 * Customer / Project一覧APIをFrontendから
 * 複数回呼び出して集計するのではなく、
 * Laravel側で集計することで、
 * データ件数が増えても正確な値を取得できる。
 */
class DashboardController extends Controller
{
    /**
     * Dashboard情報を取得する。
     *
     * GET /api/v1/dashboard
     */
    public function __invoke(
        Request $request,
    ): JsonResponse {
        /**
         * auth:sanctumによって認証された
         * 現在のLogin User。
         */
        $user = $request->user();

        /**
         * Login Userが所有しているProjectだけを対象にする
         * Base Query。
         *
         * Projectにはuser_idを持たせていないため、
         *
         * User
         *   ↓
         * Customer.user_id
         *   ↓
         * Project.customer_id
         *
         * というRelationを使って所有者を判定する。
         */
        $projectQuery = Project::query()
            ->whereHas(
                'customer',
                function (Builder $query) use ($user): void {
                    $query->where(
                        'user_id',
                        $user->id,
                    );
                },
            );

        /**
         * Customer総数。
         *
         * User Modelのcustomers Relationを利用するため、
         * 他UserのCustomerは含まれない。
         */
        $customerCount =
            $user->customers()->count();

        /**
         * Project総数。
         */
        $projectCount =
            (clone $projectQuery)->count();

        /**
         * 現在進行中のProject数。
         */
        $inProgressProjectCount =
            (clone $projectQuery)
                ->where(
                    'status',
                    'in_progress',
                )
                ->count();

        /**
         * Login Userが所有するProjectの総額。
         *
         * PostgreSQLの集計結果を
         * JSONでnumberとして扱えるようintへ変換する。
         */
        $totalProjectAmount =
            (int) (clone $projectQuery)
                ->sum('amount');

        /**
         * StatusごとのProject件数を取得する。
         *
         * DBに存在しないStatusについても
         * Frontend側で常に同じJSON構造を扱えるよう、
         * 後ほど0件を補完する。
         */
        $statusCounts =
            (clone $projectQuery)
                ->selectRaw(
                    'status, COUNT(*) AS aggregate',
                )
                ->groupBy('status')
                ->pluck(
                    'aggregate',
                    'status',
                );

        /**
         * Projectで使用できる全Status。
         *
         * Backend / Frontendともに、
         *
         * draft
         * proposal
         * negotiation
         * in_progress
         * completed
         * cancelled
         *
         * の6種類を使用する。
         *
         * 該当データが存在しないStatusも
         * 0を返すことでFrontend側の処理を単純化する。
         */
        $projectStatusCounts = [
            'draft' => (int) (
                $statusCounts['draft']
                ?? 0
            ),

            'proposal' => (int) (
                $statusCounts['proposal']
                ?? 0
            ),

            'negotiation' => (int) (
                $statusCounts['negotiation']
                ?? 0
            ),

            'inProgress' => (int) (
                $statusCounts['in_progress']
                ?? 0
            ),

            'completed' => (int) (
                $statusCounts['completed']
                ?? 0
            ),

            'cancelled' => (int) (
                $statusCounts['cancelled']
                ?? 0
            ),
        ];

        /**
         * 最近登録・更新されたProject。
         *
         * Statusに関係なく、
         * 最終更新日時が新しい順で最大5件取得する。
         *
         * DashboardからProject詳細へ遷移できるよう、
         * Customer名など表示に必要な情報も返す。
         */
        $recentProjects =
            (clone $projectQuery)
                ->with([
                    'customer:id,name',
                ])
                ->latest('updated_at')
                ->limit(5)
                ->get()
                ->map(
                    function (Project $project): array {
                        return [
                            'id' => $project->id,

                            'name' => $project->name,

                            'customerName' => $project->customer->name,

                            'status' => $project->status,

                            'amount' => $project->amount,

                            'dueDate' => $project->due_date
                                ?->format('Y-m-d'),

                            'updatedAt' => $project->updated_at
                                ?->toISOString(),
                        ];
                    },
                )
                ->values();

        /**
         * 期限が近いProject。
         *
         * ・完了済みは除外
         * ・中止済みは除外
         * ・今日以降の期限だけ対象
         * ・期限が近い順
         * ・最大5件
         *
         * とする。
         *
         * completed / cancelledは
         * 今後対応する案件ではないため、
         * Dashboardの「期限が近い案件」には表示しない。
         */
        $upcomingProjects =
            (clone $projectQuery)
                ->with([
                    'customer:id,name',
                ])
                ->whereNotIn(
                    'status',
                    [
                        'completed',
                        'cancelled',
                    ],
                )
                ->whereDate(
                    'due_date',
                    '>=',
                    today(),
                )
                ->orderBy(
                    'due_date',
                )
                ->limit(5)
                ->get()
                ->map(
                    function (Project $project): array {
                        return [
                            'id' => $project->id,

                            'name' => $project->name,

                            'customerName' => $project->customer->name,

                            'status' => $project->status,

                            'priority' => $project->priority,

                            'dueDate' => $project->due_date
                                ?->format('Y-m-d'),
                        ];
                    },
                )
                ->values();

        /**
         * Dashboard専用Response。
         *
         * Frontend側では、
         *
         * response.data.summary
         * response.data.projectStatusCounts
         * response.data.recentProjects
         * response.data.upcomingProjects
         *
         * として利用する。
         */
        return response()->json([
            'data' => [
                'summary' => [
                    'customerCount' => $customerCount,

                    'projectCount' => $projectCount,

                    'inProgressProjectCount' => $inProgressProjectCount,

                    'totalProjectAmount' => $totalProjectAmount,
                ],

                'projectStatusCounts' => $projectStatusCounts,

                'recentProjects' => $recentProjects,

                'upcomingProjects' => $upcomingProjects,
            ],
        ]);
    }
}
