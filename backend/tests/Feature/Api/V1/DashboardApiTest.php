<?php

namespace Tests\Feature\Api\V1;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Dashboard API Feature Test。
 *
 * Dashboardでは、
 *
 * ・Authentication
 * ・User別Data Scope
 * ・Summary集計
 * ・Project Status集計
 * ・Task Summary集計
 * ・Task Status集計
 * ・期限が近いTask
 *
 * を確認する。
 */
class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test用Customerを作成する。
     *
     * Dashboard APIではLogin User単位で
     * Customer / Project / Taskを集計するため、
     * Customerには必ず所有Userを設定する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createCustomer(
        User $user,
        array $overrides = [],
    ): Customer {
        return Customer::create(
            array_merge(
                [
                    'user_id' => $user->id,

                    'name' => '株式会社テスト',

                    'name_kana' => 'カブシキガイシャテスト',

                    'contact_name' => '山田 太郎',

                    'contact_name_kana' => 'ヤマダ タロウ',

                    'email' => 'customer@example.com',

                    'phone' => '03-1234-5678',

                    'postal_code' => '100-0001',

                    'address' => '東京都千代田区',

                    'industry' => 'IT',

                    'website' => 'https://example.com',

                    'status' => 'active',

                    'last_contact_date' => '2026-10-01',

                    'memo' => 'Dashboard API Test',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Projectを作成する。
     *
     * Projectにはuser_idを直接保持していないため、
     * CustomerとのRelationによって所有Userが決まる。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createProject(
        Customer $customer,
        array $overrides = [],
    ): Project {
        return Project::create(
            array_merge(
                [
                    'customer_id' => $customer->id,

                    'name' => 'テスト案件',

                    'type' => 'Webサイト制作',

                    'owner_name' => '山田 太郎',

                    'status' => 'in_progress',

                    'priority' => 'medium',

                    'amount' => 500000,

                    'start_date' => '2026-10-01',

                    'due_date' => '2026-12-31',

                    'progress' => 50,

                    'description' => 'Dashboard API Test',

                    'notes' => null,
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Taskを作成する。
     *
     * Task自身にはuser_idを保持していないため、
     *
     * Task
     *   ↓
     * Project
     *   ↓
     * Customer
     *   ↓
     * User
     *
     * のRelationによって所有Userを判定する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createTask(
        Project $project,
        array $overrides = [],
    ): Task {
        return Task::create(
            array_merge(
                [
                    'project_id' => $project->id,

                    'title' => 'Dashboard Test Task',

                    'description' => 'Dashboard API Test',

                    'status' => 'todo',

                    'priority' => 'medium',

                    'due_date' => today()
                        ->addDays(7)
                        ->format('Y-m-d'),

                    'completed_at' => null,
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Meetingを作成する。
     *
     * Meeting自身にはuser_idを保持していないため、
     *
     * Meeting
     *   ↓
     * Project
     *   ↓
     * Customer
     *   ↓
     * User
     *
     * のRelationによって所有Userを判定する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createMeeting(
        Project $project,
        array $overrides = [],
    ): Meeting {
        return Meeting::create(
            array_merge(
                [
                    'project_id' => $project->id,

                    'title' => 'Dashboard Test Meeting',

                    'description' => 'Dashboard API Test',

                    'status' => 'scheduled',

                    'method' => 'online',

                    'scheduled_at' => now()
                        ->addDays(7)
                        ->startOfMinute(),

                    'duration_minutes' => 60,

                    'location' => 'Google Meet',

                    'result' => null,

                    'next_action' => '資料送付',

                    'completed_at' => null,
                ],
                $overrides,
            ),
        );
    }

    /**
     * 未Login UserはDashboard APIへ
     * アクセスできないことを確認する。
     */
    public function test_guest_cannot_access_dashboard(): void
    {
        $response =
            $this->getJson(
                '/api/v1/dashboard',
            );

        $response->assertUnauthorized();
    }

    /**
     * Login UserのDashboard集計を取得できる。
     *
     * 次の3案件を作成して集計結果を確認する。
     *
     * ・進行中 500,000円
     * ・完了   300,000円
     * ・中止   200,000円
     *
     * 合計：
     *
     * ・Project数 3件
     * ・進行中   1件
     * ・総額     1,000,000円
     *
     * このTestではTaskを作成しないため、
     * Task関連集計はすべて0件になることも確認する。
     */
    public function test_can_get_dashboard_summary(): void
    {
        $user =
            User::factory()->create();

        $customer =
            $this->createCustomer(
                $user,
            );

        /**
         * 進行中案件。
         */
        $this->createProject(
            $customer,
            [
                'name' => '進行中案件',

                'status' => 'in_progress',

                'amount' => 500000,
            ],
        );

        /**
         * 完了案件。
         */
        $this->createProject(
            $customer,
            [
                'name' => '完了案件',

                'status' => 'completed',

                'amount' => 300000,
            ],
        );

        /**
         * 中止案件。
         */
        $this->createProject(
            $customer,
            [
                'name' => '中止案件',

                'status' => 'cancelled',

                'amount' => 200000,
            ],
        );

        $response =
            $this
                ->actingAs($user)
                ->getJson(
                    '/api/v1/dashboard',
                );

        $response
            ->assertOk()

            /**
             * Customer数。
             */
            ->assertJsonPath(
                'data.summary.customerCount',
                1,
            )

            /**
             * Project総数。
             */
            ->assertJsonPath(
                'data.summary.projectCount',
                3,
            )

            /**
             * in_progress Projectだけを集計する。
             */
            ->assertJsonPath(
                'data.summary.inProgressProjectCount',
                1,
            )

            /**
             * Project総額。
             *
             * 500,000
             * + 300,000
             * + 200,000
             * = 1,000,000
             */
            ->assertJsonPath(
                'data.summary.totalProjectAmount',
                1000000,
            )

            /**
             * このTestではTaskを登録していないため、
             * Task総数は0件。
             */
            ->assertJsonPath(
                'data.summary.taskCount',
                0,
            )

            /**
             * 対応中Taskも0件。
             */
            ->assertJsonPath(
                'data.summary.inProgressTaskCount',
                0,
            )

            /**
             * Project Status別集計。
             */
            ->assertJsonPath(
                'data.projectStatusCounts.inProgress',
                1,
            )
            ->assertJsonPath(
                'data.projectStatusCounts.completed',
                1,
            )
            ->assertJsonPath(
                'data.projectStatusCounts.cancelled',
                1,
            )

            /**
             * 作成していないProject Statusは0件。
             */
            ->assertJsonPath(
                'data.projectStatusCounts.draft',
                0,
            )
            ->assertJsonPath(
                'data.projectStatusCounts.proposal',
                0,
            )
            ->assertJsonPath(
                'data.projectStatusCounts.negotiation',
                0,
            )

            /**
             * Taskを作成していないため、
             * 全Task Statusも0件。
             */
            ->assertJsonPath(
                'data.taskStatusCounts.todo',
                0,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.inProgress',
                0,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.completed',
                0,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.cancelled',
                0,
            )

            /**
             * 期限Taskも存在しない。
             */
            ->assertJsonCount(
                0,
                'data.upcomingTasks',
            );
    }

    /**
     * TaskのDashboard集計と
     * 「期限が近いTask」を取得できる。
     *
     * 次の5件を登録する。
     *
     * ・todo        未来期限
     * ・in_progress 未来期限
     * ・completed   未来期限
     * ・cancelled   未来期限
     * ・todo        過去期限
     *
     * Task Status集計には全5件を含める。
     *
     * upcomingTasksには、
     *
     * ・completed
     * ・cancelled
     * ・過去期限
     *
     * を含めない。
     */
    public function test_can_get_task_summary_and_upcoming_tasks(): void
    {
        $user =
            User::factory()->create();

        $customer =
            $this->createCustomer(
                $user,
                [
                    'email' => 'task-dashboard@example.com',
                ],
            );

        $project =
            $this->createProject(
                $customer,
                [
                    'name' => 'Dashboard Task案件',
                ],
            );

        /**
         * 今日を基準にして期限を作成する。
         *
         * 実行日へ依存した固定日付にしないことで、
         * 将来Testを実行しても成立する。
         */
        $nearestDueDate =
            today()
                ->addDay()
                ->format('Y-m-d');

        $laterDueDate =
            today()
                ->addDays(3)
                ->format('Y-m-d');

        $completedDueDate =
            today()
                ->addDays(2)
                ->format('Y-m-d');

        $cancelledDueDate =
            today()
                ->addDays(4)
                ->format('Y-m-d');

        $pastDueDate =
            today()
                ->subDay()
                ->format('Y-m-d');

        /**
         * 対応中Task。
         *
         * 最も期限が近いため、
         * upcomingTasksの先頭になる。
         */
        $inProgressTask =
            $this->createTask(
                $project,
                [
                    'title' => '対応中Task',

                    'status' => 'in_progress',

                    'priority' => 'high',

                    'due_date' => $nearestDueDate,
                ],
            );

        /**
         * 未着手Task。
         */
        $todoTask =
            $this->createTask(
                $project,
                [
                    'title' => '未着手Task',

                    'status' => 'todo',

                    'priority' => 'medium',

                    'due_date' => $laterDueDate,
                ],
            );

        /**
         * 完了Task。
         *
         * Status集計には含めるが、
         * upcomingTasksには含めない。
         */
        $this->createTask(
            $project,
            [
                'title' => '完了Task',

                'status' => 'completed',

                'priority' => 'low',

                'due_date' => $completedDueDate,

                'completed_at' => now(),
            ],
        );

        /**
         * 中止Task。
         *
         * Status集計には含めるが、
         * upcomingTasksには含めない。
         */
        $this->createTask(
            $project,
            [
                'title' => '中止Task',

                'status' => 'cancelled',

                'priority' => 'low',

                'due_date' => $cancelledDueDate,
            ],
        );

        /**
         * 期限切れTask。
         *
         * todoなのでStatus集計には含める。
         *
         * ただし期限が過去なので、
         * upcomingTasksには含めない。
         */
        $this->createTask(
            $project,
            [
                'title' => '期限切れTask',

                'status' => 'todo',

                'priority' => 'high',

                'due_date' => $pastDueDate,
            ],
        );

        $response =
            $this
                ->actingAs($user)
                ->getJson(
                    '/api/v1/dashboard',
                );

        $response
            ->assertOk()

            /**
             * Task総数。
             */
            ->assertJsonPath(
                'data.summary.taskCount',
                5,
            )

            /**
             * in_progress Taskは1件。
             */
            ->assertJsonPath(
                'data.summary.inProgressTaskCount',
                1,
            )

            /**
             * Task Status別件数。
             *
             * todo:
             * ・未着手Task
             * ・期限切れTask
             *
             * の2件。
             */
            ->assertJsonPath(
                'data.taskStatusCounts.todo',
                2,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.inProgress',
                1,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.completed',
                1,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.cancelled',
                1,
            )

            /**
             * upcomingTasksには、
             *
             * ・対応中Task
             * ・未着手Task
             *
             * の2件だけ表示する。
             */
            ->assertJsonCount(
                2,
                'data.upcomingTasks',
            )

            /**
             * 期限が近い順。
             */
            ->assertJsonPath(
                'data.upcomingTasks.0.id',
                $inProgressTask->id,
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.title',
                '対応中Task',
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.projectId',
                $project->id,
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.projectName',
                'Dashboard Task案件',
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.customerName',
                '株式会社テスト',
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.status',
                'in_progress',
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.priority',
                'high',
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.dueDate',
                $nearestDueDate,
            )

            /**
             * 2件目は未着手Task。
             */
            ->assertJsonPath(
                'data.upcomingTasks.1.id',
                $todoTask->id,
            )
            ->assertJsonPath(
                'data.upcomingTasks.1.title',
                '未着手Task',
            )
            ->assertJsonPath(
                'data.upcomingTasks.1.dueDate',
                $laterDueDate,
            )

            /**
             * 除外対象TaskがResponseに
             * 入っていないことを確認する。
             */
            ->assertJsonMissing([
                'title' => '完了Task',
            ])
            ->assertJsonMissing([
                'title' => '中止Task',
            ])
            ->assertJsonMissing([
                'title' => '期限切れTask',
            ]);
    }

    /**
     * 他UserのCustomer / Project / Taskは
     * Dashboard集計へ含めない。
     *
     * Dashboard APIがLogin User単位で
     * Scopeされていることを確認する。
     */
    public function test_dashboard_only_contains_authenticated_user_data(): void
    {
        /**
         * DashboardへLoginするUser。
         */
        $user =
            User::factory()->create();

        /**
         * 別User。
         */
        $otherUser =
            User::factory()->create();

        /**
         * Login User所有Customer。
         */
        $customer =
            $this->createCustomer(
                $user,
                [
                    'email' => 'owner@example.com',
                ],
            );

        /**
         * 別User所有Customer。
         */
        $otherCustomer =
            $this->createCustomer(
                $otherUser,
                [
                    'name' => '他ユーザー株式会社',

                    'email' => 'other@example.com',
                ],
            );

        /**
         * Login User所有Project。
         */
        $project =
            $this->createProject(
                $customer,
                [
                    'name' => '自分の案件',

                    'amount' => 100000,
                ],
            );

        /**
         * 別User所有Project。
         *
         * この案件はDashboardへ
         * 一切含まれてはいけない。
         */
        $otherProject =
            $this->createProject(
                $otherCustomer,
                [
                    'name' => '他ユーザー案件',

                    'amount' => 900000,
                ],
            );

        /**
         * Login User所有Task。
         */
        $this->createTask(
            $project,
            [
                'title' => '自分のTask',

                'status' => 'in_progress',

                'priority' => 'high',

                'due_date' => today()
                    ->addDay()
                    ->format('Y-m-d'),
            ],
        );

        /**
         * 別User所有Task。
         *
         * Dashboard集計・upcomingTasksの
         * どちらにも含めない。
         */
        $this->createTask(
            $otherProject,
            [
                'title' => '他ユーザーTask',

                'status' => 'in_progress',

                'priority' => 'high',

                'due_date' => today()
                    ->addDay()
                    ->format('Y-m-d'),
            ],
        );

        $response =
            $this
                ->actingAs($user)
                ->getJson(
                    '/api/v1/dashboard',
                );

        $response
            ->assertOk()

            /**
             * Login User所有Customerだけなので1件。
             */
            ->assertJsonPath(
                'data.summary.customerCount',
                1,
            )

            /**
             * Login User所有Projectだけなので1件。
             */
            ->assertJsonPath(
                'data.summary.projectCount',
                1,
            )

            /**
             * 他Userの900,000円は含まれない。
             */
            ->assertJsonPath(
                'data.summary.totalProjectAmount',
                100000,
            )

            /**
             * Login User所有Taskだけなので1件。
             */
            ->assertJsonPath(
                'data.summary.taskCount',
                1,
            )

            /**
             * Login User所有のin_progress Taskだけを
             * 集計する。
             */
            ->assertJsonPath(
                'data.summary.inProgressTaskCount',
                1,
            )
            ->assertJsonPath(
                'data.taskStatusCounts.inProgress',
                1,
            )

            /**
             * Login UserのTaskだけが
             * upcomingTasksへ表示される。
             */
            ->assertJsonCount(
                1,
                'data.upcomingTasks',
            )
            ->assertJsonPath(
                'data.upcomingTasks.0.title',
                '自分のTask',
            )

            /**
             * Recent Project等にも
             * 他User案件が含まれない。
             */
            ->assertJsonMissing([
                'name' => '他ユーザー案件',
            ])

            /**
             * 他User Taskも含まれない。
             */
            ->assertJsonMissing([
                'title' => '他ユーザーTask',
            ]);
    }

    /**
     * MeetingのDashboard集計と
     * 「予定が近いMeeting」を取得できる。
     *
     * Status集計にはLogin User所有Meetingをすべて含める。
     *
     * upcomingMeetingsには、
     *
     * ・scheduled
     * ・現在時刻以降
     *
     * のMeetingだけを予定日時が近い順で返す。
     */
    public function test_can_get_meeting_summary_and_upcoming_meetings(): void
    {
        $user =
            User::factory()->create();

        $customer =
            $this->createCustomer(
                $user,
                [
                    'email' => 'meeting-dashboard@example.com',
                ],
            );

        $project =
            $this->createProject(
                $customer,
                [
                    'name' => 'Dashboard Meeting案件',
                ],
            );

        $nearestScheduledAt =
            now()
                ->addHour()
                ->startOfMinute();

        $laterScheduledAt =
            now()
                ->addHours(3)
                ->startOfMinute();

        /**
         * upcomingMeetingsの先頭になるMeeting。
         */
        $nearestMeeting =
            $this->createMeeting(
                $project,
                [
                    'title' => '直近商談',

                    'method' => 'online',

                    'scheduled_at' => $nearestScheduledAt,

                    'duration_minutes' => 45,

                    'location' => 'Google Meet',
                ],
            );

        /**
         * 2番目の予定Meeting。
         */
        $laterMeeting =
            $this->createMeeting(
                $project,
                [
                    'title' => '次回商談',

                    'method' => 'in_person',

                    'scheduled_at' => $laterScheduledAt,

                    'location' => '東京本社',
                ],
            );

        /**
         * 過去日時のscheduled Meeting。
         *
         * Status集計には含むが、
         * upcomingMeetingsには含めない。
         */
        $this->createMeeting(
            $project,
            [
                'title' => '過去予定商談',

                'status' => 'scheduled',

                'scheduled_at' => now()
                    ->subHour()
                    ->startOfMinute(),
            ],
        );

        /**
         * 完了Meeting。
         */
        $this->createMeeting(
            $project,
            [
                'title' => '完了商談',

                'status' => 'completed',

                'scheduled_at' => now()
                    ->addHours(2)
                    ->startOfMinute(),

                'completed_at' => now(),
            ],
        );

        /**
         * 中止Meeting。
         */
        $this->createMeeting(
            $project,
            [
                'title' => '中止商談',

                'status' => 'cancelled',

                'scheduled_at' => now()
                    ->addHours(4)
                    ->startOfMinute(),
            ],
        );

        /**
         * 別User所有Meeting。
         *
         * Summary / Status / upcomingMeetingsの
         * すべてから除外される必要がある。
         */
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer(
                $otherUser,
                [
                    'email' => 'other-meeting-dashboard@example.com',
                ],
            );

        $otherProject =
            $this->createProject(
                $otherCustomer,
                [
                    'name' => '他User案件',
                ],
            );

        $this->createMeeting(
            $otherProject,
            [
                'title' => '他User商談',

                'scheduled_at' => now()
                    ->addMinutes(30)
                    ->startOfMinute(),
            ],
        );

        $response =
            $this
                ->actingAs($user)
                ->getJson(
                    '/api/v1/dashboard',
                );

        $response
            ->assertOk()

            /**
             * 自User所有Meetingは5件。
             */
            ->assertJsonPath(
                'data.summary.meetingCount',
                5,
            )

            /**
             * scheduledは、
             *
             * ・直近商談
             * ・次回商談
             * ・過去予定商談
             *
             * の3件。
             */
            ->assertJsonPath(
                'data.summary.scheduledMeetingCount',
                3,
            )

            ->assertJsonPath(
                'data.meetingStatusCounts.scheduled',
                3,
            )

            ->assertJsonPath(
                'data.meetingStatusCounts.completed',
                1,
            )

            ->assertJsonPath(
                'data.meetingStatusCounts.cancelled',
                1,
            )

            /**
             * upcomingMeetingsは未来scheduledだけ。
             */
            ->assertJsonCount(
                2,
                'data.upcomingMeetings',
            )

            /**
             * 日時が近い順。
             */
            ->assertJsonPath(
                'data.upcomingMeetings.0.id',
                $nearestMeeting->id,
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.title',
                '直近商談',
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.projectId',
                $project->id,
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.projectName',
                'Dashboard Meeting案件',
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.customerName',
                '株式会社テスト',
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.status',
                'scheduled',
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.method',
                'online',
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.durationMinutes',
                45,
            )

            ->assertJsonPath(
                'data.upcomingMeetings.0.location',
                'Google Meet',
            )

            ->assertJsonPath(
                'data.upcomingMeetings.1.id',
                $laterMeeting->id,
            )

            /**
             * 他User Meetingが含まれていないことを確認する。
             */
            ->assertJsonMissing([
                'title' => '他User商談',
            ]);
    }
}
