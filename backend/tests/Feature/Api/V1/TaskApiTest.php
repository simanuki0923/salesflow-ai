<?php

namespace Tests\Feature\Api\V1;

use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Task REST API Feature Test。
 *
 * ・一覧
 * ・検索
 * ・絞り込み
 * ・登録
 * ・詳細
 * ・部分更新
 * ・削除
 * ・completed_at制御
 * ・Authentication
 * ・User単位Data Scope
 * ・他User DataへのAccess制御
 *
 * をHTTP Request単位で確認する。
 */
class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 各Testで使用するLogin User。
     */
    private User $user;

    /**
     * 各Test実行前の共通準備。
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->user =
            User::factory()->create();

        $this->actingAs(
            $this->user,
        );
    }

    /**
     * Test用Customerを作成する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createCustomer(
        array $overrides = [],
    ): Customer {
        return Customer::create(
            array_merge(
                [
                    'user_id' => $this->user->id,

                    'name' => '株式会社テスト',

                    'name_kana' => 'カブシキガイシャテスト',

                    'contact_name' => '山田 太郎',

                    'contact_name_kana' => 'ヤマダ タロウ',

                    'email' => 'task-api@example.com',

                    'phone' => '03-1234-5678',

                    'postal_code' => '100-0001',

                    'address' => '東京都千代田区',

                    'industry' => 'IT',

                    'website' => 'https://example.com',

                    'status' => 'active',

                    'last_contact_date' => '2026-10-01',

                    'memo' => 'Task API Test',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Projectを作成する。
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

                    'priority' => 'high',

                    'amount' => 500000,

                    'start_date' => '2026-10-01',

                    'due_date' => '2026-12-31',

                    'progress' => 50,

                    'description' => 'Task API Test',

                    'notes' => 'Task API Test用案件',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Taskを作成する。
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

                    'title' => '提案資料を作成する',

                    'description' => '顧客向け提案資料を作成する。',

                    'status' => 'todo',

                    'priority' => 'medium',

                    'due_date' => '2026-10-31',

                    'completed_at' => null,
                ],
                $overrides,
            ),
        );
    }

    /**
     * Task一覧を取得できる。
     */
    public function test_can_get_task_list(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $task =
            $this->createTask(
                $project,
            );

        $response =
            $this->getJson(
                '/api/v1/tasks',
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.id',
                $task->id,
            )
            ->assertJsonPath(
                'data.0.title',
                '提案資料を作成する',
            )
            ->assertJsonPath(
                'data.0.projectId',
                $project->id,
            )
            ->assertJsonPath(
                'data.0.projectName',
                'テスト案件',
            )
            ->assertJsonPath(
                'data.0.customerName',
                '株式会社テスト',
            );
    }

    /**
     * Task名で検索できる。
     *
     * Task APIでは、
     *
     * ・Task名
     * ・Task詳細
     * ・Project名
     * ・Customer名
     *
     * も検索対象としている。
     *
     * そのため対象外Taskには
     * 検索語「提案」を含まないDescriptionを設定する。
     */
    public function test_can_search_tasks(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $this->createTask(
            $project,
            [
                'title' => '提案資料を作成する',

                'description' => '顧客向け提案資料を作成する。',
            ],
        );

        $this->createTask(
            $project,
            [
                'title' => '請求内容を確認する',

                /**
                 * 検索語「提案」を含めない。
                 *
                 * createTask()のDefault Descriptionには
                 * 「提案」が含まれるため、
                 * 明示的に別Descriptionへ差し替える。
                 */
                'description' => '請求内容と入金状況を確認する。',
            ],
        );

        $response =
            $this->getJson(
                '/api/v1/tasks?search=提案',
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.title',
                '提案資料を作成する',
            );
    }

    /**
     * Status・Priority・Projectで絞り込める。
     */
    public function test_can_filter_tasks(): void
    {
        $customer =
            $this->createCustomer();

        $targetProject =
            $this->createProject(
                $customer,
                [
                    'name' => '対象案件',
                ],
            );

        $otherProject =
            $this->createProject(
                $customer,
                [
                    'name' => '別案件',
                ],
            );

        $this->createTask(
            $targetProject,
            [
                'title' => '対象Task',

                'status' => 'in_progress',

                'priority' => 'high',
            ],
        );

        $this->createTask(
            $targetProject,
            [
                'title' => 'Status対象外Task',

                'status' => 'completed',

                'priority' => 'high',
            ],
        );

        $this->createTask(
            $otherProject,
            [
                'title' => 'Project対象外Task',

                'status' => 'in_progress',

                'priority' => 'high',
            ],
        );

        $response =
            $this->getJson(
                '/api/v1/tasks'
                .'?status=in_progress'
                .'&priority=high'
                ."&projectId={$targetProject->id}",
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.title',
                '対象Task',
            );
    }

    /**
     * Taskを新規登録できる。
     */
    public function test_can_create_task(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response =
            $this->postJson(
                '/api/v1/tasks',
                [
                    'projectId' => $project->id,

                    'title' => '見積書を作成する',

                    'description' => '顧客へ提出する見積書を作成する。',

                    'status' => 'todo',

                    'priority' => 'high',

                    'dueDate' => '2026-11-15',
                ],
            );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.projectId',
                $project->id,
            )
            ->assertJsonPath(
                'data.projectName',
                'テスト案件',
            )
            ->assertJsonPath(
                'data.customerName',
                '株式会社テスト',
            )
            ->assertJsonPath(
                'data.title',
                '見積書を作成する',
            )
            ->assertJsonPath(
                'data.status',
                'todo',
            )
            ->assertJsonPath(
                'data.priority',
                'high',
            )
            ->assertJsonPath(
                'data.dueDate',
                '2026-11-15',
            );

        /**
         * camelCaseからsnake_caseへ
         * 正しく変換され、
         * TaskがDBへ保存されていることを確認する。
         *
         * due_dateはDB Driverによって
         *
         * 2026-11-15
         *
         * または
         *
         * 2026-11-15 00:00:00
         *
         * のように内部表現が異なる可能性がある。
         *
         * そのためDB生値ではなく、
         * Task Modelのdate Castを通して日付を確認する。
         */
        $this->assertDatabaseHas(
            'tasks',
            [
                'project_id' => $project->id,

                'title' => '見積書を作成する',

                'status' => 'todo',

                'priority' => 'high',
            ],
        );

        $task =
            Task::query()
                ->where(
                    'title',
                    '見積書を作成する',
                )
                ->firstOrFail();

        $this->assertSame(
            $project->id,
            $task->project_id,
        );

        $this->assertSame(
            '2026-11-15',
            $task
                ->due_date
                ->toDateString(),
        );
    }

    /**
     * completed状態で登録した場合、
     * completed_atが自動設定される。
     */
    public function test_completed_task_sets_completed_at_on_create(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response =
            $this->postJson(
                '/api/v1/tasks',
                [
                    'projectId' => $project->id,

                    'title' => '完了済みTask',

                    'status' => 'completed',

                    'priority' => 'medium',

                    'dueDate' => '2026-10-17',
                ],
            );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.status',
                'completed',
            );

        $this->assertNotNull(
            $response->json(
                'data.completedAt',
            ),
        );

        $task =
            Task::query()
                ->where(
                    'title',
                    '完了済みTask',
                )
                ->firstOrFail();

        $this->assertNotNull(
            $task->completed_at,
        );
    }

    /**
     * 他User所有ProjectへTaskを登録できない。
     */
    public function test_cannot_create_task_for_other_users_project(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'name' => '他Userの顧客',

                'email' => 'other-task-create@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
                [
                    'name' => '他Userの案件',
                ],
            );

        $response =
            $this->postJson(
                '/api/v1/tasks',
                [
                    'projectId' => $otherProject->id,

                    'title' => '不正Task',

                    'status' => 'todo',

                    'priority' => 'medium',
                ],
            );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'projectId',
            ]);
    }

    /**
     * Task詳細を取得できる。
     */
    public function test_can_get_task_detail(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $task =
            $this->createTask(
                $project,
            );

        $response =
            $this->getJson(
                "/api/v1/tasks/{$task->id}",
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.id',
                $task->id,
            )
            ->assertJsonPath(
                'data.title',
                '提案資料を作成する',
            )
            ->assertJsonPath(
                'data.projectName',
                'テスト案件',
            )
            ->assertJsonPath(
                'data.customerName',
                '株式会社テスト',
            );
    }

    /**
     * PATCHで指定項目だけ更新できる。
     *
     * completedへの変更時には
     * completed_atも自動設定される。
     */
    public function test_can_partially_update_task(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $task =
            $this->createTask(
                $project,
            );

        $response =
            $this->patchJson(
                "/api/v1/tasks/{$task->id}",
                [
                    'status' => 'completed',

                    'priority' => 'high',
                ],
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'completed',
            )
            ->assertJsonPath(
                'data.priority',
                'high',
            )
            ->assertJsonPath(
                'data.title',
                '提案資料を作成する',
            );

        $this->assertNotNull(
            $response->json(
                'data.completedAt',
            ),
        );

        $task->refresh();

        $this->assertSame(
            'completed',
            $task->status,
        );

        $this->assertNotNull(
            $task->completed_at,
        );
    }

    /**
     * completedから未完了Statusへ戻した場合、
     * completed_atをnullへ戻す。
     */
    public function test_reopening_task_clears_completed_at(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $task =
            $this->createTask(
                $project,
                [
                    'status' => 'completed',

                    'completed_at' => '2026-10-17 12:00:00',
                ],
            );

        $response =
            $this->patchJson(
                "/api/v1/tasks/{$task->id}",
                [
                    'status' => 'in_progress',
                ],
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'in_progress',
            )
            ->assertJsonPath(
                'data.completedAt',
                null,
            );

        $task->refresh();

        $this->assertNull(
            $task->completed_at,
        );
    }

    /**
     * Taskを削除できる。
     */
    public function test_can_delete_task(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $task =
            $this->createTask(
                $project,
            );

        $response =
            $this->deleteJson(
                "/api/v1/tasks/{$task->id}",
            );

        $response->assertNoContent();

        $this->assertDatabaseMissing(
            'tasks',
            [
                'id' => $task->id,
            ],
        );
    }

    /**
     * 未認証UserはTask一覧を取得できない。
     */
    public function test_guest_cannot_access_task_list(): void
    {
        auth()->logout();

        $response =
            $this->getJson(
                '/api/v1/tasks',
            );

        $response->assertUnauthorized();
    }

    /**
     * Task一覧にはLogin User自身のTaskだけ表示される。
     */
    public function test_task_list_only_contains_authenticated_user_tasks(): void
    {
        $ownCustomer =
            $this->createCustomer([
                'name' => '自分の顧客',

                'email' => 'own-task@example.com',
            ]);

        $ownProject =
            $this->createProject(
                $ownCustomer,
                [
                    'name' => '自分の案件',
                ],
            );

        $ownTask =
            $this->createTask(
                $ownProject,
                [
                    'title' => '自分のTask',
                ],
            );

        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'name' => '他Userの顧客',

                'email' => 'other-task-list@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
                [
                    'name' => '他Userの案件',
                ],
            );

        $this->createTask(
            $otherProject,
            [
                'title' => '他UserのTask',
            ],
        );

        $response =
            $this->getJson(
                '/api/v1/tasks',
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.id',
                $ownTask->id,
            )
            ->assertJsonPath(
                'data.0.title',
                '自分のTask',
            )
            ->assertJsonMissing([
                'title' => '他UserのTask',
            ]);
    }

    /**
     * 他User所有Taskの詳細は取得できない。
     */
    public function test_cannot_get_other_users_task(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-task-detail@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $task =
            $this->createTask(
                $otherProject,
            );

        $response =
            $this->getJson(
                "/api/v1/tasks/{$task->id}",
            );

        $response->assertNotFound();
    }

    /**
     * 他User所有Taskは更新できない。
     */
    public function test_cannot_update_other_users_task(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-task-update@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $task =
            $this->createTask(
                $otherProject,
            );

        $response =
            $this->patchJson(
                "/api/v1/tasks/{$task->id}",
                [
                    'title' => '不正更新',
                ],
            );

        $response->assertNotFound();

        $this->assertDatabaseMissing(
            'tasks',
            [
                'id' => $task->id,

                'title' => '不正更新',
            ],
        );
    }

    /**
     * 他User所有Taskは削除できない。
     */
    public function test_cannot_delete_other_users_task(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-task-delete@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $task =
            $this->createTask(
                $otherProject,
            );

        $response =
            $this->deleteJson(
                "/api/v1/tasks/{$task->id}",
            );

        $response->assertNotFound();

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
            ],
        );
    }

    /**
     * Taskを他User所有Projectへ移動できない。
     */
    public function test_cannot_move_task_to_other_users_project(): void
    {
        /**
         * Login User自身のTask。
         */
        $ownCustomer =
            $this->createCustomer([
                'email' => 'own-task-move@example.com',
            ]);

        $ownProject =
            $this->createProject(
                $ownCustomer,
            );

        $task =
            $this->createTask(
                $ownProject,
            );

        /**
         * 他User所有Project。
         */
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-task-move@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $response =
            $this->patchJson(
                "/api/v1/tasks/{$task->id}",
                [
                    'projectId' => $otherProject->id,
                ],
            );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'projectId',
            ]);

        /**
         * 元のProjectから移動していないことも確認する。
         */
        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,

                'project_id' => $ownProject->id,
            ],
        );
    }
}
