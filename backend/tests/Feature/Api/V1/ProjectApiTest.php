<?php

namespace Tests\Feature\Api\V1;

use App\Models\Customer;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Project REST APIのFeature Test。
 *
 * ・一覧
 * ・検索
 * ・Filter
 * ・登録
 * ・Validation
 * ・詳細
 * ・部分更新
 * ・削除
 *
 * をHTTP Request単位で確認する。
 */
class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

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
                    'user_id' => null,

                    'name' => '株式会社テスト',

                    'name_kana' => 'カブシキガイシャテスト',

                    'contact_name' => '山田 太郎',

                    'contact_name_kana' => 'ヤマダ タロウ',

                    'email' => 'test@example.com',

                    'phone' => '03-1234-5678',

                    'postal_code' => '100-0001',

                    'address' => '東京都千代田区',

                    'industry' => 'IT',

                    'website' => 'https://example.com',

                    'status' => 'active',

                    'last_contact_date' => '2026-10-01',

                    'memo' => 'Project API Test',
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

                    'description' => 'Project API Test',

                    'notes' => 'テスト用メモ',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Project一覧を取得できる。
     *
     * customerNameもResourceから返ることを確認する。
     */
    public function test_can_get_project_list(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response = $this->getJson(
            '/api/v1/projects',
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.0.id',
                $project->id,
            )
            ->assertJsonPath(
                'data.0.name',
                'テスト案件',
            )
            ->assertJsonPath(
                'data.0.customerName',
                '株式会社テスト',
            )
            ->assertJsonPath(
                'data.0.amount',
                500000,
            );
    }

    /**
     * 案件名で検索できる。
     */
    public function test_can_search_projects(): void
    {
        $customer =
            $this->createCustomer();

        $this->createProject(
            $customer,
            [
                'name' => 'Webサイト制作案件',
            ],
        );

        $this->createProject(
            $customer,
            [
                'name' => '業務システム開発',
            ],
        );

        $response = $this->getJson(
            '/api/v1/projects?search=Web',
        );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.name',
                'Webサイト制作案件',
            );
    }

    /**
     * StatusとPriorityで絞り込める。
     */
    public function test_can_filter_projects(): void
    {
        $customer =
            $this->createCustomer();

        $this->createProject(
            $customer,
            [
                'name' => '対象案件',

                'status' => 'in_progress',

                'priority' => 'high',
            ],
        );

        $this->createProject(
            $customer,
            [
                'name' => '対象外案件',

                'status' => 'completed',

                'priority' => 'low',
            ],
        );

        $response = $this->getJson(
            '/api/v1/projects?status=in_progress&priority=high',
        );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.name',
                '対象案件',
            );
    }

    /**
     * Projectを新規登録できる。
     */
    public function test_can_create_project(): void
    {
        $customer =
            $this->createCustomer();

        $payload = [
            'name' => '新規案件',

            'customerId' => $customer->id,

            'type' => 'システム開発',

            'ownerName' => '佐藤 花子',

            'status' => 'proposal',

            'priority' => 'medium',

            'amount' => 800000,

            'startDate' => '2026-10-10',

            'dueDate' => '2026-12-20',

            'progress' => 10,

            'description' => '新規Project API Test',

            'notes' => null,
        ];

        $response = $this->postJson(
            '/api/v1/projects',
            $payload,
        );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.name',
                '新規案件',
            )
            ->assertJsonPath(
                'data.customerId',
                $customer->id,
            )
            ->assertJsonPath(
                'data.customerName',
                '株式会社テスト',
            )
            ->assertJsonPath(
                'data.ownerName',
                '佐藤 花子',
            );

        /**
         * camelCaseからsnake_caseへ
         * 正しく変換されたことを確認する。
         */
        $this->assertDatabaseHas(
            'projects',
            [
                'name' => '新規案件',

                'customer_id' => $customer->id,

                'owner_name' => '佐藤 花子',

                'amount' => 800000,
            ],
        );
    }

    /**
     * 存在しないCustomer IDでは
     * Projectを登録できない。
     */
    public function test_project_requires_existing_customer(): void
    {
        $response = $this->postJson(
            '/api/v1/projects',
            [
                'name' => '不正案件',

                'customerId' => 999999,

                'ownerName' => '山田 太郎',

                'status' => 'draft',

                'priority' => 'medium',

                'amount' => 100000,

                'startDate' => '2026-10-01',

                'dueDate' => '2026-10-31',

                'progress' => 0,
            ],
        );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'customerId',
            ]);
    }

    /**
     * 期限は開始日より前にできない。
     */
    public function test_due_date_must_be_on_or_after_start_date(): void
    {
        $customer =
            $this->createCustomer();

        $response = $this->postJson(
            '/api/v1/projects',
            [
                'name' => '日付Validation案件',

                'customerId' => $customer->id,

                'ownerName' => '山田 太郎',

                'status' => 'draft',

                'priority' => 'medium',

                'amount' => 100000,

                'startDate' => '2026-12-31',

                'dueDate' => '2026-10-01',

                'progress' => 0,
            ],
        );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'dueDate',
            ]);
    }

    /**
     * Project詳細を取得できる。
     */
    public function test_can_get_project_detail(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response = $this->getJson(
            "/api/v1/projects/{$project->id}",
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.id',
                $project->id,
            )
            ->assertJsonPath(
                'data.name',
                'テスト案件',
            )
            ->assertJsonPath(
                'data.customerName',
                '株式会社テスト',
            );
    }

    /**
     * PATCHで指定した項目だけ更新できる。
     */
    public function test_can_partially_update_project(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response = $this->patchJson(
            "/api/v1/projects/{$project->id}",
            [
                'status' => 'completed',

                'progress' => 100,
            ],
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'completed',
            )
            ->assertJsonPath(
                'data.progress',
                100,
            );

        /**
         * 更新対象ではない情報が
         * 消えていないことも確認する。
         */
        $this->assertDatabaseHas(
            'projects',
            [
                'id' => $project->id,

                'name' => 'テスト案件',

                'owner_name' => '山田 太郎',

                'status' => 'completed',

                'progress' => 100,
            ],
        );
    }

    /**
     * PATCHで開始日だけ変更した場合でも、
     * 既存期限との整合性を確認する。
     */
    public function test_partial_update_validates_existing_due_date(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
                [
                    'start_date' => '2026-10-01',

                    'due_date' => '2026-12-31',
                ],
            );

        $response = $this->patchJson(
            "/api/v1/projects/{$project->id}",
            [
                'startDate' => '2027-01-01',
            ],
        );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'dueDate',
            ]);
    }

    /**
     * Projectを削除できる。
     */
    public function test_can_delete_project(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response = $this->deleteJson(
            "/api/v1/projects/{$project->id}",
        );

        $response->assertNoContent();

        $this->assertDatabaseMissing(
            'projects',
            [
                'id' => $project->id,
            ],
        );
    }
}
