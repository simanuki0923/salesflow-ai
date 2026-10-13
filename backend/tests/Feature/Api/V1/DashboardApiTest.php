<?php

namespace Tests\Feature\Api\V1;

use App\Models\Customer;
use App\Models\Project;
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
     * Customer / Projectを集計するため、
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
         *
         * cancelledも正式なProject Statusなので、
         * DashboardのStatus別集計へ含まれることを確認する。
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
             *
             * 進行中・完了・中止の3件。
             */
            ->assertJsonPath(
                'data.summary.projectCount',
                3,
            )

            /**
             * in_progressだけを集計するため1件。
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
             * Status別集計。
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
             * 作成していないStatusは0件になる。
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
            );
    }

    /**
     * 他UserのCustomer / Projectは
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
        $this->createProject(
            $customer,
            [
                'amount' => 100000,
            ],
        );

        /**
         * 別User所有Project。
         *
         * この案件はDashboardへ
         * 一切含まれてはいけない。
         */
        $this->createProject(
            $otherCustomer,
            [
                'name' => '他ユーザー案件',

                'amount' => 900000,
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
             * Recent Project等にも
             * 他User案件が含まれないことを確認する。
             */
            ->assertJsonMissing([
                'name' => '他ユーザー案件',
            ]);
    }
}
