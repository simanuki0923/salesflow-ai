<?php

namespace Tests\Feature\Demo;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * 公開Demo AccountのRead Only Modeを確認する。
 */
class DemoReadOnlyModeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Demo Userは参照系APIを利用できる。
     */
    public function test_demo_user_can_read_customer_list(): void
    {
        $demoUser =
            $this->createDemoUser();

        $this->actingAs(
            $demoUser,
        );

        $this
            ->getJson(
                '/api/v1/customers',
            )
            ->assertOk();
    }

    /**
     * Demo UserはCustomer / Project / Task / Meetingを
     * 新規登録できない。
     *
     * MiddlewareはFormRequest Validationより手前で
     * State-changing Requestを拒否するため、
     * Payloadが空でも403になる。
     */
    public function test_demo_user_cannot_create_crud_resources(): void
    {
        $demoUser =
            $this->createDemoUser();

        $this->actingAs(
            $demoUser,
        );

        $endpoints = [
            '/api/v1/customers',
            '/api/v1/projects',
            '/api/v1/tasks',
            '/api/v1/meetings',
        ];

        foreach ($endpoints as $endpoint) {
            $this
                ->postJson(
                    $endpoint,
                    [],
                )
                ->assertForbidden()
                ->assertJson([
                    'message' => '公開Demoアカウントではデータの登録・変更・削除はできません。',
                ]);
        }
    }

    /**
     * Demo UserでもMeeting AI提案は利用できる。
     *
     * AI提案はFormへ候補を返すだけで、
     * Databaseを更新しないためRead Only対象外とする。
     */
    public function test_demo_user_can_use_meeting_ai_suggestion(): void
    {
        config([
            'ai.meeting.enabled' => true,
            'ai.provider' => 'demo',
        ]);

        $demoUser =
            $this->createDemoUser();

        $this->actingAs(
            $demoUser,
        );

        $this
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                [
                    'title' => 'Demo商談',
                    'description' => '顧客の要望と次回対応について整理する。',
                ],
            )
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'result',
                    'nextAction',
                ],
            ]);
    }

    /**
     * 通常Userは従来どおり
     * Customerを登録できる。
     */
    public function test_regular_user_can_create_customer(): void
    {
        $user =
            User::factory()->create([
                'email' => 'normal@example.com',
            ]);

        $this->actingAs(
            $user,
        );

        $this
            ->postJson(
                '/api/v1/customers',
                [
                    'name' => '株式会社テスト',
                    'contactName' => '山田 太郎',
                    'email' => 'customer@example.com',
                    'status' => 'active',
                ],
            )
            ->assertCreated();

        $this->assertDatabaseHas(
            'customers',
            [
                'user_id' => $user->id,
                'name' => '株式会社テスト',
                'email' => 'customer@example.com',
            ],
        );
    }

    /**
     * DEMO_READ_ONLYを無効にした環境では、
     * Demo Userも通常Userと同様に変更できる。
     *
     * Local開発時の動作確認などに利用できる。
     */
    public function test_demo_read_only_mode_can_be_disabled(): void
    {
        $demoUser =
            $this->createDemoUser(
                readOnly: false,
            );

        $this->actingAs(
            $demoUser,
        );

        $this
            ->postJson(
                '/api/v1/customers',
                [
                    'name' => 'Demo編集確認株式会社',
                    'contactName' => 'Demo User',
                    'email' => 'editable@example.com',
                    'status' => 'active',
                ],
            )
            ->assertCreated();
    }

    /**
     * MiddlewareがDemo Userと判断するUserを作成する。
     */
    private function createDemoUser(
        bool $readOnly = true,
    ): User {
        config([
            'demo.read_only' => $readOnly,
            'demo.user.email' => 'demo@salesflow-ai.local',
        ]);

        return User::factory()->create([
            'name' => 'SalesFlow AI Demo',
            'email' => 'demo@salesflow-ai.local',
        ]);
    }
}
