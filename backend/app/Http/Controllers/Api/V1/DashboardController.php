<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\Task;
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
 * ・Task数
 * ・対応中Task数
 * ・Meeting数
 * ・予定Meeting数
 * ・Project Status別件数
 * ・Task Status別件数
 * ・Meeting Status別件数
 * ・最近のProject
 * ・期限が近いProject
 * ・期限が近いTask
 * ・予定が近いMeeting
 *
 * をDashboard表示用にまとめて返す。
 *
 * Customer / Project / Task一覧APIをFrontendから
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
         * Login Userが所有しているTaskだけを対象にする
         * Base Query。
         *
         * Task自身にはuser_idを持たせていないため、
         *
         * User
         *   ↓
         * Customer.user_id
         *   ↓
         * Project.customer_id
         *   ↓
         * Task.project_id
         *
         * というRelationを使って所有者を判定する。
         *
         * Task REST APIと同じOwnershipルールを
         * Dashboardでも使用する。
         */
        $taskQuery = Task::query()
            ->whereHas(
                'project.customer',
                function (Builder $query) use ($user): void {
                    $query->where(
                        'user_id',
                        $user->id,
                    );
                },
            );

        /**
         * Login Userが所有しているMeetingだけを対象にする
         * Base Query。
         *
         * Meeting自身にはuser_idを持たないため、
         *
         * User
         *   ↓
         * Customer
         *   ↓
         * Project
         *   ↓
         * Meeting
         *
         * のRelationを使用してOwnershipを判定する。
         *
         * Meeting REST APIと同じOwnershipルールを
         * Dashboardでも使用する。
         */
        $meetingQuery = Meeting::query()
            ->whereHas(
                'project.customer',
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
         * Task総数。
         */
        $taskCount =
            (clone $taskQuery)->count();

        /**
         * 現在対応中のTask数。
         */
        $inProgressTaskCount =
            (clone $taskQuery)
                ->where(
                    'status',
                    'in_progress',
                )
                ->count();

        /**
         * Meeting総数。
         */
        $meetingCount =
            (clone $meetingQuery)->count();

        /**
         * 現在予定状態のMeeting数。
         *
         * 日時が過去でもstatusがscheduledなら、
         * Status集計上は予定Meetingとして数える。
         */
        $scheduledMeetingCount =
            (clone $meetingQuery)
                ->where(
                    'status',
                    'scheduled',
                )
                ->count();

        /**
         * StatusごとのProject件数を取得する。
         *
         * DBに存在しないStatusについても
         * Frontend側で常に同じJSON構造を扱えるよう、
         * 後ほど0件を補完する。
         */
        $projectStatusCountData =
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
         */
        $projectStatusCounts = [
            'draft' => (int) (
                $projectStatusCountData['draft']
                ?? 0
            ),

            'proposal' => (int) (
                $projectStatusCountData['proposal']
                ?? 0
            ),

            'negotiation' => (int) (
                $projectStatusCountData['negotiation']
                ?? 0
            ),

            'inProgress' => (int) (
                $projectStatusCountData['in_progress']
                ?? 0
            ),

            'completed' => (int) (
                $projectStatusCountData['completed']
                ?? 0
            ),

            'cancelled' => (int) (
                $projectStatusCountData['cancelled']
                ?? 0
            ),
        ];

        /**
         * StatusごとのTask件数を取得する。
         *
         * Task Domainで使用するStatusは、
         *
         * todo
         * in_progress
         * completed
         * cancelled
         *
         * の4種類。
         */
        $taskStatusCountData =
            (clone $taskQuery)
                ->selectRaw(
                    'status, COUNT(*) AS aggregate',
                )
                ->groupBy('status')
                ->pluck(
                    'aggregate',
                    'status',
                );

        /**
         * Task Status別件数。
         *
         * DBに該当Taskが存在しないStatusについても
         * 必ず0を返す。
         */
        $taskStatusCounts = [
            'todo' => (int) (
                $taskStatusCountData['todo']
                ?? 0
            ),

            'inProgress' => (int) (
                $taskStatusCountData['in_progress']
                ?? 0
            ),

            'completed' => (int) (
                $taskStatusCountData['completed']
                ?? 0
            ),

            'cancelled' => (int) (
                $taskStatusCountData['cancelled']
                ?? 0
            ),
        ];

        /**
         * StatusごとのMeeting件数を取得する。
         *
         * Meeting Domainで使用するStatus：
         *
         * scheduled
         * completed
         * cancelled
         */
        $meetingStatusCountData =
            (clone $meetingQuery)
                ->selectRaw(
                    'status, COUNT(*) AS aggregate',
                )
                ->groupBy('status')
                ->pluck(
                    'aggregate',
                    'status',
                );

        /**
         * Meeting Status別件数。
         *
         * DBに存在しないStatusも0件として返し、
         * Frontendで常に同じJSON構造を扱えるようにする。
         */
        $meetingStatusCounts = [
            'scheduled' => (int) (
                $meetingStatusCountData['scheduled']
                ?? 0
            ),

            'completed' => (int) (
                $meetingStatusCountData['completed']
                ?? 0
            ),

            'cancelled' => (int) (
                $meetingStatusCountData['cancelled']
                ?? 0
            ),
        ];

        /**
         * 最近登録・更新されたProject。
         *
         * Statusに関係なく、
         * 最終更新日時が新しい順で最大5件取得する。
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
         * 期限が近いTask。
         *
         * ・完了済みは除外
         * ・中止済みは除外
         * ・期限未設定は除外
         * ・今日以降の期限だけ対象
         * ・期限が近い順
         * ・最大5件
         *
         * DashboardからTask編集画面や
         * Project詳細へ遷移できるよう、
         * Project / Customer情報も取得する。
         */
        $upcomingTasks =
            (clone $taskQuery)
                ->with([
                    'project:id,customer_id,name',
                    'project.customer:id,name',
                ])
                ->whereNotIn(
                    'status',
                    [
                        'completed',
                        'cancelled',
                    ],
                )
                ->whereNotNull(
                    'due_date',
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
                    function (Task $task): array {
                        return [
                            'id' => $task->id,

                            'projectId' => $task->project->id,

                            'projectName' => $task->project->name,

                            'customerName' => $task->project
                                ->customer
                                ->name,

                            'title' => $task->title,

                            'status' => $task->status,

                            'priority' => $task->priority,

                            'dueDate' => $task->due_date
                                ?->format('Y-m-d'),
                        ];
                    },
                )
                ->values();

        /**
         * 予定日時が近いMeeting。
         *
         * ・scheduledだけ対象
         * ・現在時刻以降だけ対象
         * ・予定日時が近い順
         * ・最大5件
         *
         * DashboardからMeeting編集画面や
         * Project詳細へ遷移できるよう、
         * Project / Customer情報も取得する。
         */
        $upcomingMeetings =
            (clone $meetingQuery)
                ->with([
                    'project:id,customer_id,name',
                    'project.customer:id,name',
                ])
                ->where(
                    'status',
                    'scheduled',
                )
                ->where(
                    'scheduled_at',
                    '>=',
                    now(),
                )
                ->orderBy(
                    'scheduled_at',
                )
                ->limit(5)
                ->get()
                ->map(
                    function (Meeting $meeting): array {
                        return [
                            'id' => $meeting->id,

                            'projectId' => $meeting->project->id,

                            'projectName' => $meeting->project->name,

                            'customerName' => $meeting->project
                                ->customer
                                ->name,

                            'title' => $meeting->title,

                            'status' => $meeting->status,

                            'method' => $meeting->method,

                            'scheduledAt' => $meeting->scheduled_at
                                ?->toISOString(),

                            'durationMinutes' => $meeting->duration_minutes,

                            'location' => $meeting->location,
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
         * response.data.taskStatusCounts
         * response.data.meetingStatusCounts
         * response.data.recentProjects
         * response.data.upcomingProjects
         * response.data.upcomingTasks
         * response.data.upcomingMeetings
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

                    'taskCount' => $taskCount,

                    'inProgressTaskCount' => $inProgressTaskCount,

                    'meetingCount' => $meetingCount,

                    'scheduledMeetingCount' => $scheduledMeetingCount,
                ],

                'projectStatusCounts' => $projectStatusCounts,

                'taskStatusCounts' => $taskStatusCounts,

                'meetingStatusCounts' => $meetingStatusCounts,

                'recentProjects' => $recentProjects,

                'upcomingProjects' => $upcomingProjects,

                'upcomingTasks' => $upcomingTasks,

                'upcomingMeetings' => $upcomingMeetings,
            ],
        ]);
    }
}
