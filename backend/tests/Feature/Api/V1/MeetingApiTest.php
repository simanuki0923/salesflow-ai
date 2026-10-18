<?php

namespace Tests\Feature\Api\V1;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Meeting REST API Feature Test。
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
class MeetingApiTest extends TestCase
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

                    'email' => 'meeting-api@example.com',

                    'phone' => '03-1234-5678',

                    'postal_code' => '100-0001',

                    'address' => '東京都千代田区',

                    'industry' => 'IT',

                    'website' => 'https://example.com',

                    'status' => 'active',

                    'last_contact_date' => '2026-10-01',

                    'memo' => 'Meeting API Test',
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

                    'description' => 'Meeting API Test',

                    'notes' => 'Meeting API Test用案件',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Meetingを作成する。
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

                    'title' => '初回ヒアリング',

                    'description' => '顧客要件を確認する。',

                    'status' => 'scheduled',

                    'method' => 'online',

                    'scheduled_at' => '2026-11-10 14:00:00',

                    'duration_minutes' => 60,

                    'location' => 'Google Meet',

                    'result' => null,

                    'next_action' => null,

                    'completed_at' => null,
                ],
                $overrides,
            ),
        );
    }

    /**
     * Meeting一覧を取得できる。
     */
    public function test_can_get_meeting_list(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
            );

        $response =
            $this->getJson(
                '/api/v1/meetings',
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.id',
                $meeting->id,
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
            )
            ->assertJsonPath(
                'data.0.title',
                '初回ヒアリング',
            )
            ->assertJsonPath(
                'data.0.status',
                'scheduled',
            )
            ->assertJsonPath(
                'data.0.method',
                'online',
            )
            ->assertJsonPath(
                'data.0.durationMinutes',
                60,
            );

        /**
         * scheduled_atがResourceを通して
         * ISO 8601形式で返されていることを確認する。
         *
         * Time Zone設定による表現差を避けるため、
         * ここではnullではないことを確認する。
         */
        $this->assertNotNull(
            $response->json(
                'data.0.scheduledAt',
            ),
        );
    }

    /**
     * MeetingをKeyword検索できる。
     *
     * Meeting APIでは、
     *
     * ・Meeting名
     * ・Meeting詳細
     * ・場所
     * ・商談結果
     * ・次回対応
     * ・Project名
     * ・Customer名
     *
     * を検索対象とする。
     */
    public function test_can_search_meetings(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $this->createMeeting(
            $project,
            [
                'title' => '導入打ち合わせ',

                'description' => '導入要件について確認する。',
            ],
        );

        $this->createMeeting(
            $project,
            [
                'title' => '請求内容確認',

                'description' => '請求金額を確認する。',

                'location' => '東京本社',

                'result' => '請求内容について合意した。',

                'next_action' => '請求書を送付する。',
            ],
        );

        $response =
            $this->getJson(
                '/api/v1/meetings?search=導入',
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.title',
                '導入打ち合わせ',
            );
    }

    /**
     * Status・Method・Projectで絞り込める。
     */
    public function test_can_filter_meetings(): void
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

        /**
         * すべてのFilter条件へ一致するMeeting。
         */
        $this->createMeeting(
            $targetProject,
            [
                'title' => '対象Meeting',

                'status' => 'scheduled',

                'method' => 'online',
            ],
        );

        /**
         * Statusだけ不一致。
         */
        $this->createMeeting(
            $targetProject,
            [
                'title' => 'Status対象外Meeting',

                'status' => 'completed',

                'method' => 'online',
            ],
        );

        /**
         * Methodだけ不一致。
         */
        $this->createMeeting(
            $targetProject,
            [
                'title' => 'Method対象外Meeting',

                'status' => 'scheduled',

                'method' => 'phone',
            ],
        );

        /**
         * Projectだけ不一致。
         */
        $this->createMeeting(
            $otherProject,
            [
                'title' => 'Project対象外Meeting',

                'status' => 'scheduled',

                'method' => 'online',
            ],
        );

        $response =
            $this->getJson(
                '/api/v1/meetings'
                .'?status=scheduled'
                .'&method=online'
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
                '対象Meeting',
            );
    }

    /**
     * Meetingを新規登録できる。
     */
    public function test_can_create_meeting(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response =
            $this->postJson(
                '/api/v1/meetings',
                [
                    'projectId' => $project->id,

                    'title' => '見積内容確認',

                    'description' => '見積書の内容について確認する。',

                    'status' => 'scheduled',

                    'method' => 'online',

                    'scheduledAt' => '2026-11-15T10:30:00',

                    'durationMinutes' => 60,

                    'location' => 'Microsoft Teams',

                    'result' => null,

                    'nextAction' => '見積書を送付する',
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
                '見積内容確認',
            )
            ->assertJsonPath(
                'data.status',
                'scheduled',
            )
            ->assertJsonPath(
                'data.method',
                'online',
            )
            ->assertJsonPath(
                'data.durationMinutes',
                60,
            )
            ->assertJsonPath(
                'data.location',
                'Microsoft Teams',
            )
            ->assertJsonPath(
                'data.nextAction',
                '見積書を送付する',
            )
            ->assertJsonPath(
                'data.completedAt',
                null,
            );

        /**
         * camelCaseからsnake_caseへ変換され、
         * DBへ保存されていることを確認する。
         */
        $this->assertDatabaseHas(
            'meetings',
            [
                'project_id' => $project->id,

                'title' => '見積内容確認',

                'status' => 'scheduled',

                'method' => 'online',

                'duration_minutes' => 60,
            ],
        );

        $meeting =
            Meeting::query()
                ->where(
                    'title',
                    '見積内容確認',
                )
                ->firstOrFail();

        $this->assertSame(
            $project->id,
            $meeting->project_id,
        );

        $this->assertSame(
            '2026-11-15 10:30:00',
            $meeting
                ->scheduled_at
                ->format(
                    'Y-m-d H:i:s',
                ),
        );

        $this->assertSame(
            60,
            $meeting
                ->duration_minutes,
        );
    }

    /**
     * completed状態で登録した場合、
     * completed_atが自動設定される。
     */
    public function test_completed_meeting_sets_completed_at_on_create(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $response =
            $this->postJson(
                '/api/v1/meetings',
                [
                    'projectId' => $project->id,

                    'title' => '完了済み商談',

                    'status' => 'completed',

                    'method' => 'in_person',

                    'scheduledAt' => '2026-10-18T10:00:00',
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

        $meeting =
            Meeting::query()
                ->where(
                    'title',
                    '完了済み商談',
                )
                ->firstOrFail();

        $this->assertNotNull(
            $meeting->completed_at,
        );
    }

    /**
     * 他User所有Projectへ
     * Meetingを登録できない。
     */
    public function test_cannot_create_meeting_for_other_users_project(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'name' => '他Userの顧客',

                'email' => 'other-meeting-create@example.com',
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
                '/api/v1/meetings',
                [
                    'projectId' => $otherProject->id,

                    'title' => '不正Meeting',

                    'status' => 'scheduled',

                    'method' => 'online',

                    'scheduledAt' => '2026-11-15T10:00:00',
                ],
            );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'projectId',
            ]);
    }

    /**
     * Meeting詳細を取得できる。
     */
    public function test_can_get_meeting_detail(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
            );

        $response =
            $this->getJson(
                "/api/v1/meetings/{$meeting->id}",
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.id',
                $meeting->id,
            )
            ->assertJsonPath(
                'data.title',
                '初回ヒアリング',
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
                'data.status',
                'scheduled',
            )
            ->assertJsonPath(
                'data.method',
                'online',
            );
    }

    /**
     * PATCHで指定項目だけ更新できる。
     *
     * completedへの変更時には
     * completed_atも自動設定される。
     */
    public function test_can_partially_update_meeting(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
            );

        $response =
            $this->patchJson(
                "/api/v1/meetings/{$meeting->id}",
                [
                    'status' => 'completed',

                    'method' => 'phone',

                    'durationMinutes' => 30,

                    'result' => '見積内容について合意した。',

                    'nextAction' => '契約書を送付する。',
                ],
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'completed',
            )
            ->assertJsonPath(
                'data.method',
                'phone',
            )
            ->assertJsonPath(
                'data.durationMinutes',
                30,
            )
            ->assertJsonPath(
                'data.result',
                '見積内容について合意した。',
            )
            ->assertJsonPath(
                'data.nextAction',
                '契約書を送付する。',
            )
            ->assertJsonPath(
                'data.title',
                '初回ヒアリング',
            );

        $this->assertNotNull(
            $response->json(
                'data.completedAt',
            ),
        );

        $meeting->refresh();

        $this->assertSame(
            'completed',
            $meeting->status,
        );

        $this->assertSame(
            'phone',
            $meeting->method,
        );

        $this->assertNotNull(
            $meeting->completed_at,
        );
    }

    /**
     * completedからscheduledへ戻した場合、
     * completed_atをnullへ戻す。
     */
    public function test_reopening_meeting_clears_completed_at(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
                [
                    'status' => 'completed',

                    'completed_at' => '2026-10-18 12:00:00',
                ],
            );

        $response =
            $this->patchJson(
                "/api/v1/meetings/{$meeting->id}",
                [
                    'status' => 'scheduled',
                ],
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'scheduled',
            )
            ->assertJsonPath(
                'data.completedAt',
                null,
            );

        $meeting->refresh();

        $this->assertNull(
            $meeting->completed_at,
        );
    }

    /**
     * Meetingを削除できる。
     */
    public function test_can_delete_meeting(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
            );

        $response =
            $this->deleteJson(
                "/api/v1/meetings/{$meeting->id}",
            );

        $response->assertNoContent();

        $this->assertDatabaseMissing(
            'meetings',
            [
                'id' => $meeting->id,
            ],
        );
    }

    /**
     * 未認証Userは
     * Meeting一覧を取得できない。
     */
    public function test_guest_cannot_access_meeting_list(): void
    {
        auth()->logout();

        $response =
            $this->getJson(
                '/api/v1/meetings',
            );

        $response->assertUnauthorized();
    }

    /**
     * Meeting一覧には
     * Login User自身のMeetingだけ表示される。
     */
    public function test_meeting_list_only_contains_authenticated_user_meetings(): void
    {
        $ownCustomer =
            $this->createCustomer([
                'name' => '自分の顧客',

                'email' => 'own-meeting@example.com',
            ]);

        $ownProject =
            $this->createProject(
                $ownCustomer,
                [
                    'name' => '自分の案件',
                ],
            );

        $ownMeeting =
            $this->createMeeting(
                $ownProject,
                [
                    'title' => '自分のMeeting',
                ],
            );

        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'name' => '他Userの顧客',

                'email' => 'other-meeting-list@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
                [
                    'name' => '他Userの案件',
                ],
            );

        $this->createMeeting(
            $otherProject,
            [
                'title' => '他UserのMeeting',
            ],
        );

        $response =
            $this->getJson(
                '/api/v1/meetings',
            );

        $response
            ->assertOk()
            ->assertJsonCount(
                1,
                'data',
            )
            ->assertJsonPath(
                'data.0.id',
                $ownMeeting->id,
            )
            ->assertJsonPath(
                'data.0.title',
                '自分のMeeting',
            )
            ->assertJsonMissing([
                'title' => '他UserのMeeting',
            ]);
    }

    /**
     * 他User所有Meetingの詳細は
     * 取得できない。
     */
    public function test_cannot_get_other_users_meeting(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-meeting-detail@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $meeting =
            $this->createMeeting(
                $otherProject,
            );

        $response =
            $this->getJson(
                "/api/v1/meetings/{$meeting->id}",
            );

        $response->assertNotFound();
    }

    /**
     * 他User所有Meetingは更新できない。
     */
    public function test_cannot_update_other_users_meeting(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-meeting-update@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $meeting =
            $this->createMeeting(
                $otherProject,
            );

        $response =
            $this->patchJson(
                "/api/v1/meetings/{$meeting->id}",
                [
                    'title' => '不正更新',
                ],
            );

        $response->assertNotFound();

        $meeting->refresh();

        $this->assertSame(
            '初回ヒアリング',
            $meeting->title,
        );
    }

    /**
     * 他User所有Meetingは削除できない。
     */
    public function test_cannot_delete_other_users_meeting(): void
    {
        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'email' => 'other-meeting-delete@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
            );

        $meeting =
            $this->createMeeting(
                $otherProject,
            );

        $response =
            $this->deleteJson(
                "/api/v1/meetings/{$meeting->id}",
            );

        $response->assertNotFound();

        $this->assertDatabaseHas(
            'meetings',
            [
                'id' => $meeting->id,
            ],
        );
    }

    /**
     * Meetingを他User所有Projectへ
     * 移動できない。
     */
    public function test_cannot_move_meeting_to_other_users_project(): void
    {
        $ownCustomer =
            $this->createCustomer();

        $ownProject =
            $this->createProject(
                $ownCustomer,
            );

        $meeting =
            $this->createMeeting(
                $ownProject,
            );

        $otherUser =
            User::factory()->create();

        $otherCustomer =
            $this->createCustomer([
                'user_id' => $otherUser->id,

                'name' => '他Userの顧客',

                'email' => 'other-meeting-move@example.com',
            ]);

        $otherProject =
            $this->createProject(
                $otherCustomer,
                [
                    'name' => '他Userの案件',
                ],
            );

        $response =
            $this->patchJson(
                "/api/v1/meetings/{$meeting->id}",
                [
                    'projectId' => $otherProject->id,
                ],
            );

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'projectId',
            ]);

        $meeting->refresh();

        $this->assertSame(
            $ownProject->id,
            $meeting->project_id,
        );
    }
}
