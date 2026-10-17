<?php

namespace Tests\Feature\Models;

use App\Models\Customer;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Task Domain Model Test。
 *
 * Task Domainでは、
 *
 * ・Task → Project Relation
 * ・Project → Tasks Relation
 * ・due_date / completed_atのCast
 * ・Project削除時のTask Cascade Delete
 *
 * を確認する。
 *
 * HTTP APIの動作ではなく、
 * Model / Database Relationそのものが
 * 正しく動作することを目的とする。
 */
class TaskModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test用User。
     *
     * Task自身にはuser_idを持たせず、
     *
     * User
     * ↓
     * Customer
     * ↓
     * Project
     * ↓
     * Task
     *
     * のRelationによって所有Userを判定する。
     */
    private User $user;

    /**
     * 各Test実行前の共通準備。
     */
    protected function setUp(): void
    {
        parent::setUp();

        /**
         * Customerの所有者となる
         * Test用Userを作成する。
         */
        $this->user =
            User::factory()->create();
    }

    /**
     * Test用Customerを作成する。
     *
     * ProjectApiTestで使用している
     * Customer構造と同じ必須項目を使用する。
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

                    'email' => 'task-model@example.com',

                    'phone' => '03-1234-5678',

                    'postal_code' => '100-0001',

                    'address' => '東京都千代田区',

                    'industry' => 'IT',

                    'website' => 'https://example.com',

                    'status' => 'active',

                    'last_contact_date' => '2026-10-01',

                    'memo' => 'Task Model Test',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Projectを作成する。
     *
     * ProjectApiTestで使用している
     * Project構造と同じ必須項目を使用する。
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

                    'description' => 'Task Model Test',

                    'notes' => 'Task Model Test用案件',
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
     * Taskから所属Projectを取得できる。
     *
     * Task N : 1 Project
     */
    public function test_task_belongs_to_project(): void
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

        /**
         * Task Modelのproject Relationから
         * 所属Projectを取得できることを確認する。
         */
        $this->assertSame(
            $project->id,
            $task->project->id,
        );

        $this->assertSame(
            'テスト案件',
            $task->project->name,
        );
    }

    /**
     * Projectから紐づくTask一覧を取得できる。
     *
     * Project 1 : N Task
     */
    public function test_project_has_many_tasks(): void
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
            ],
        );

        $this->createTask(
            $project,
            [
                'title' => '見積書を作成する',
            ],
        );

        /**
         * Project Modelのtasks Relationから
         * 2件のTaskを取得できることを確認する。
         */
        $this->assertCount(
            2,
            $project->tasks,
        );

        $this->assertSame(
            2,
            $project
                ->tasks()
                ->count(),
        );

        /**
         * Relationから取得したTaskの中に
         * 指定したTask名が存在することを確認する。
         */
        $this->assertTrue(
            $project
                ->tasks
                ->contains(
                    'title',
                    '提案資料を作成する',
                ),
        );

        $this->assertTrue(
            $project
                ->tasks
                ->contains(
                    'title',
                    '見積書を作成する',
                ),
        );
    }

    /**
     * due_date / completed_atが
     * LaravelのDate ObjectへCastされる。
     */
    public function test_task_date_fields_are_cast(): void
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

                    'due_date' => '2026-10-31',

                    'completed_at' => '2026-10-17 15:30:00',
                ],
            );

        /**
         * due_dateはTask Modelで
         * date Castを設定しているため、
         * Carbon Objectとして日付操作できる。
         */
        $this->assertSame(
            '2026-10-31',
            $task
                ->due_date
                ->toDateString(),
        );

        /**
         * completed_atはdatetime Castによって
         * Carbon Objectとして取得できる。
         */
        $this->assertSame(
            '2026-10-17 15:30:00',
            $task
                ->completed_at
                ->format(
                    'Y-m-d H:i:s',
                ),
        );
    }

    /**
     * Project削除時に、
     * Projectへ所属するTaskも削除される。
     *
     * tasks.project_idのForeign Keyに設定した
     * cascadeOnDelete()が正しく動作することを確認する。
     */
    public function test_deleting_project_cascades_tasks(): void
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

        /**
         * Project削除前には
         * TaskがDBへ存在している。
         */
        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,

                'project_id' => $project->id,
            ],
        );

        /**
         * 親Projectを削除する。
         */
        $project->delete();

        /**
         * Foreign KeyのCascade Deleteによって
         * 子Taskも削除されていることを確認する。
         */
        $this->assertDatabaseMissing(
            'tasks',
            [
                'id' => $task->id,
            ],
        );
    }
}
