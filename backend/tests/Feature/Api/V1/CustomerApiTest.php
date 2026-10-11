<?php

namespace Tests\Feature\Api\V1;

use App\Models\Customer;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Customer REST APIのFeature Test。
 *
 * 実際のHTTP Requestに近い形で、
 *
 * ・認証済みUserによるAPIアクセス
 * ・一覧
 * ・登録
 * ・詳細
 * ・更新
 * ・削除
 * ・Validation
 * ・User単位のData Scope
 * ・他User DataへのAccess制御
 *
 * を確認する。
 */
class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 各Testで使用するLogin User。
     *
     * Customer APIはauth:sanctumで保護されているため、
     * APIへアクセスする前に認証済みUserを用意する。
     */
    private User $user;

    /**
     * 各Test実行前の共通準備。
     */
    protected function setUp(): void
    {
        parent::setUp();

        /**
         * Test用Userを作成する。
         */
        $this->user = User::factory()->create();

        /**
         * LaravelのSession Authenticationで
         * Login済み状態にする。
         *
         * /api/v1/customersはauth:sanctumで
         * 保護されているため、
         * 未認証のままだと401になる。
         */
        $this->actingAs(
            $this->user,
        );
    }

    /**
     * Testで使用するCustomerを作成する。
     *
     * Factoryへ依存せず、
     * 現在のCustomer Modelだけで確認できるようにする。
     *
     * Login User自身が所有するCustomerとして作成する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createCustomer(
        array $overrides = [],
    ): Customer {
        return Customer::create(
            array_merge(
                [
                    /**
                     * Customer APIはUser単位でScopeされるため、
                     * Test中のLogin Userを所有者に設定する。
                     */
                    'user_id' => $this->user->id,

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

                    'memo' => 'API Test Customer',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Customer一覧を取得できる。
     */
    public function test_can_get_customer_list(): void
    {
        $customer =
            $this->createCustomer();

        $response = $this->getJson(
            '/api/v1/customers',
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.0.id',
                $customer->id,
            )
            ->assertJsonPath(
                'data.0.name',
                '株式会社テスト',
            )
            ->assertJsonPath(
                'data.0.contactName',
                '山田 太郎',
            )
            ->assertJsonPath(
                'data.0.projectCount',
                0,
            );
    }

    /**
     * Customerを新規登録できる。
     */
    public function test_can_create_customer(): void
    {
        $payload = [
            'name' => '新規株式会社',

            'nameKana' => 'シンキカブシキガイシャ',

            'contactName' => '佐藤 花子',

            'contactNameKana' => 'サトウ ハナコ',

            'email' => 'new@example.com',

            'phone' => '03-9999-9999',

            'postalCode' => '160-0000',

            'address' => '東京都新宿区',

            'industry' => 'Web',

            'website' => 'https://example.com',

            'status' => 'active',

            'lastContactDate' => '2026-10-05',

            'memo' => '新規登録テスト',
        ];

        $response = $this->postJson(
            '/api/v1/customers',
            $payload,
        );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.name',
                '新規株式会社',
            )
            ->assertJsonPath(
                'data.contactName',
                '佐藤 花子',
            );

        /**
         * APIのcamelCaseが
         * DBのsnake_caseへ正しく変換されたか確認する。
         *
         * さらにuser_idがFrontendからではなく、
         * Login UserからBackend側で設定されたことも確認する。
         */
        $this->assertDatabaseHas(
            'customers',
            [
                'user_id' => $this->user->id,

                'name' => '新規株式会社',

                'contact_name' => '佐藤 花子',

                'postal_code' => '160-0000',
            ],
        );
    }

    /**
     * 必須項目がなければ422になる。
     */
    public function test_customer_creation_requires_mandatory_fields(): void
    {
        $response = $this->postJson(
            '/api/v1/customers',
            [],
        );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'contactName',
                'email',
                'status',
            ]);
    }

    /**
     * Customer詳細を取得できる。
     */
    public function test_can_get_customer_detail(): void
    {
        $customer =
            $this->createCustomer();

        $response = $this->getJson(
            "/api/v1/customers/{$customer->id}",
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.id',
                $customer->id,
            )
            ->assertJsonPath(
                'data.name',
                '株式会社テスト',
            );
    }

    /**
     * PATCHで指定項目だけ更新できる。
     */
    public function test_can_partially_update_customer(): void
    {
        $customer =
            $this->createCustomer();

        $response = $this->patchJson(
            "/api/v1/customers/{$customer->id}",
            [
                'name' => '更新後株式会社',
            ],
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.name',
                '更新後株式会社',
            );

        /**
         * nameだけ変更し、
         * contact_name等が消えていないことも確認する。
         *
         * また、更新によってCustomerの所有者が
         * 変更されていないことも確認する。
         */
        $this->assertDatabaseHas(
            'customers',
            [
                'id' => $customer->id,

                'user_id' => $this->user->id,

                'name' => '更新後株式会社',

                'contact_name' => '山田 太郎',
            ],
        );
    }

    /**
     * ProjectがないCustomerは削除できる。
     */
    public function test_can_delete_customer_without_projects(): void
    {
        $customer =
            $this->createCustomer();

        $response = $this->deleteJson(
            "/api/v1/customers/{$customer->id}",
        );

        $response->assertNoContent();

        $this->assertDatabaseMissing(
            'customers',
            [
                'id' => $customer->id,
            ],
        );
    }

    /**
     * Projectが存在するCustomerは削除できない。
     */
    public function test_cannot_delete_customer_with_projects(): void
    {
        $customer =
            $this->createCustomer();

        Project::create([
            'customer_id' => $customer->id,

            'name' => '削除制御確認案件',

            'type' => 'Webサイト制作',

            'owner_name' => '山田 太郎',

            'status' => 'in_progress',

            'priority' => 'medium',

            'amount' => 100000,

            'start_date' => '2026-10-01',

            'due_date' => '2026-10-31',

            'progress' => 50,

            'description' => 'Customer削除制御確認',

            'notes' => null,
        ]);

        $response = $this->deleteJson(
            "/api/v1/customers/{$customer->id}",
        );

        $response
            ->assertStatus(409)
            ->assertJson([
                'message' => '案件が存在する顧客は削除できません。',
            ]);

        $this->assertDatabaseHas(
            'customers',
            [
                'id' => $customer->id,
            ],
        );
    }

    /**
     * 未認証UserはCustomer一覧を取得できない。
     *
     * routes/api.phpのauth:sanctumが
     * 正しく機能していることを確認する。
     */
    public function test_guest_cannot_access_customer_list(): void
    {
        /**
         * setUp()で作成したLogin状態を解除し、
         * Guest状態に戻す。
         */
        auth()->logout();

        $response = $this->getJson(
            '/api/v1/customers',
        );

        $response->assertUnauthorized();
    }

    /**
     * Customer一覧には
     * Login User自身のCustomerだけ表示される。
     */
    public function test_customer_list_only_contains_authenticated_user_customers(): void
    {
        /**
         * 現在LoginしているUserのCustomer。
         */
        $ownCustomer =
            $this->createCustomer([
                'name' => '自分の顧客',
                'email' => 'own@example.com',
            ]);

        /**
         * 別Userを作成する。
         */
        $otherUser =
            User::factory()->create();

        /**
         * 別User所有Customer。
         *
         * createCustomer()は通常$this->userを設定するが、
         * overridesで別Userへ差し替える。
         */
        $this->createCustomer([
            'user_id' => $otherUser->id,
            'name' => '他Userの顧客',
            'email' => 'other@example.com',
        ]);

        $response = $this->getJson(
            '/api/v1/customers',
        );

        /**
         * Login User自身のCustomerだけが
         * Responseへ含まれることを確認する。
         */
        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.id',
                $ownCustomer->id,
            )
            ->assertJsonPath(
                'data.0.name',
                '自分の顧客',
            );
    }

    /**
     * 他User所有Customerの詳細は取得できない。
     */
    public function test_cannot_get_other_users_customer(): void
    {
        $otherUser =
            User::factory()->create();

        $customer =
            $this->createCustomer([
                'user_id' => $otherUser->id,
                'name' => '他Userの顧客',
                'email' => 'other-detail@example.com',
            ]);

        $response = $this->getJson(
            "/api/v1/customers/{$customer->id}",
        );

        /**
         * 403ではなく404にすることで、
         * Customerの存在自体を他Userへ公開しない。
         */
        $response->assertNotFound();
    }

    /**
     * 他User所有Customerは更新できない。
     */
    public function test_cannot_update_other_users_customer(): void
    {
        $otherUser =
            User::factory()->create();

        $customer =
            $this->createCustomer([
                'user_id' => $otherUser->id,
                'name' => '他Userの顧客',
                'email' => 'other-update@example.com',
            ]);

        $response = $this->patchJson(
            "/api/v1/customers/{$customer->id}",
            [
                'name' => '不正な更新',
            ],
        );

        $response->assertNotFound();

        /**
         * HTTP Responseだけでなく、
         * Databaseも変更されていないことを確認する。
         */
        $this->assertDatabaseHas(
            'customers',
            [
                'id' => $customer->id,
                'user_id' => $otherUser->id,
                'name' => '他Userの顧客',
            ],
        );

        $this->assertDatabaseMissing(
            'customers',
            [
                'id' => $customer->id,
                'name' => '不正な更新',
            ],
        );
    }

    /**
     * 他User所有Customerは削除できない。
     */
    public function test_cannot_delete_other_users_customer(): void
    {
        $otherUser =
            User::factory()->create();

        $customer =
            $this->createCustomer([
                'user_id' => $otherUser->id,
                'name' => '他Userの削除対象顧客',
                'email' => 'other-delete@example.com',
            ]);

        $response = $this->deleteJson(
            "/api/v1/customers/{$customer->id}",
        );

        $response->assertNotFound();

        /**
         * 削除が拒否されたため、
         * CustomerがDatabaseに残っていることを確認する。
         */
        $this->assertDatabaseHas(
            'customers',
            [
                'id' => $customer->id,
                'user_id' => $otherUser->id,
            ],
        );
    }
}
