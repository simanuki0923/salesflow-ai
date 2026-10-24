<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Meeting AI提案API Feature Test。
 *
 * TestではHttp::fake()を使用し、
 * 実際のOpenAI APIへ通信しない。
 *
 * 確認対象：
 *
 * Browser
 *   ↓
 * POST /api/v1/meeting-ai/suggest
 *   ↓
 * SuggestMeetingAiRequest
 *   ↓
 * MeetingAiSuggestionController
 *   ↓
 * OpenAiMeetingSuggestionService
 *   ↓
 * OpenAI Responses API
 *
 * のApplication側Integration。
 */
class MeetingAiSuggestionApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 各Test共通のOpenAI設定。
     *
     * 実際の.envに保存されたAPI Keyは使用せず、
     * Test専用のDummy値へ差し替える。
     */
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'ai.meeting.enabled' => true,

            'ai.meeting.provider' => 'openai',

            'services.openai.api_key' => 'test-openai-key',

            'services.openai.model' => 'gpt-6-luna',

            'services.openai.base_url' => 'https://api.openai.com/v1',
        ]);

        /**
         * Http::fake()していない外部通信が
         * 発生した場合はTestを失敗させる。
         *
         * これによりTest実行による
         * OpenAI API課金を防止する。
         */
        Http::preventStrayRequests();
    }

    /**
     * Test用AI Request Payload。
     *
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'title' => '初回ヒアリング',

            'description' => '顧客から現行業務の入力作業を減らしたいという要望があった。見積書の提示を希望している。',

            'result' => '',

            'nextAction' => '',
        ];
    }

    /**
     * 未Login UserはAI提案APIを利用できない。
     */
    public function test_guest_cannot_generate_meeting_ai_suggestion(): void
    {
        Http::fake();

        $this
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertUnauthorized();

        /**
         * Authenticationで拒否されるため、
         * OpenAI APIへの通信も行われない。
         */
        Http::assertNothingSent();
    }

    /**
     * 商談内容descriptionは必須。
     */
    public function test_description_is_required_for_meeting_ai_suggestion(): void
    {
        Http::fake();

        $user =
            User::factory()->create();

        $payload =
            $this->validPayload();

        $payload['description'] =
            '';

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $payload,
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'description',
            ]);

        /**
         * Validation Errorの場合も
         * OpenAI APIへRequestしない。
         */
        Http::assertNothingSent();
    }

    /**
     * OpenAIのStructured Outputを解析して、
     *
     * result
     * nextAction
     *
     * をFrontend向けResponseとして返せる。
     */
    public function test_can_generate_meeting_ai_suggestion(): void
    {
        /**
         * 実OpenAI APIの代わりに
         * Responses APIのResponseを再現する。
         */
        Http::fake([
            'https://api.openai.com/v1/responses' => Http::response(
                [
                    'id' => 'resp_test',

                    'status' => 'completed',

                    'output' => [
                        [
                            'type' => 'message',

                            'id' => 'msg_test',

                            'status' => 'completed',

                            'role' => 'assistant',

                            'content' => [
                                [
                                    'type' => 'output_text',

                                    'text' => json_encode(
                                        [
                                            'result' => '顧客は入力作業の削減を希望しており、見積書の提示を求めている。',

                                            'nextAction' => '顧客要望を整理した見積書を作成し、次回商談で提示する。',
                                        ],
                                        JSON_THROW_ON_ERROR
                                        | JSON_UNESCAPED_UNICODE,
                                    ),
                                ],
                            ],
                        ],
                    ],
                ],
                200,
            ),
        ]);

        $user =
            User::factory()->create();

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'result' => '顧客は入力作業の削減を希望しており、見積書の提示を求めている。',

                    'nextAction' => '顧客要望を整理した見積書を作成し、次回商談で提示する。',
                ],
            ]);

        /**
         * LaravelからOpenAIへ送るRequest内容も確認する。
         */
        Http::assertSent(
            function (
                HttpRequest $request,
            ): bool {
                $body =
                    $request->data();

                return
                    $request->method()
                    === 'POST'

                    && $request->url()
                    === 'https://api.openai.com/v1/responses'

                    && $request->hasHeader(
                        'Authorization',
                        'Bearer test-openai-key',
                    )

                    && (
                        $body['model']
                        ?? null
                    ) === 'gpt-6-luna'

                    && (
                        $body['store']
                        ?? null
                    ) === false

                    && (
                        data_get(
                            $body,
                            'text.format.type',
                        )
                        === 'json_schema'
                    )

                    && (
                        data_get(
                            $body,
                            'text.format.name',
                        )
                        === 'meeting_ai_suggestion'
                    )

                    && str_contains(
                        (string) (
                            $body['input']
                            ?? ''
                        ),
                        '初回ヒアリング',
                    )

                    && str_contains(
                        (string) (
                            $body['input']
                            ?? ''
                        ),
                        '入力作業を減らしたい',
                    );
            },
        );
    }

    /**
     * すでに入力済みのresult / nextActionも、
     * AI改善提案用Contextとして送信する。
     */
    public function test_existing_meeting_result_and_next_action_are_sent_to_openai(): void
    {
        Http::fake([
            'https://api.openai.com/v1/responses' => Http::response(
                [
                    'output' => [
                        [
                            'type' => 'message',

                            'content' => [
                                [
                                    'type' => 'output_text',

                                    'text' => json_encode(
                                        [
                                            'result' => '既存の結果を踏まえた要約。',

                                            'nextAction' => '既存の対応予定を踏まえた次回対応案。',
                                        ],
                                        JSON_THROW_ON_ERROR
                                        | JSON_UNESCAPED_UNICODE,
                                    ),
                                ],
                            ],
                        ],
                    ],
                ],
                200,
            ),
        ]);

        $user =
            User::factory()->create();

        $payload =
            $this->validPayload();

        $payload['result'] =
            '顧客は導入に前向き。';

        $payload['nextAction'] =
            '来週までに見積書を送付する。';

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $payload,
            )
            ->assertOk();

        Http::assertSent(
            function (
                HttpRequest $request,
            ): bool {
                $input =
                    (string) (
                        $request->data()[
                            'input'
                        ]
                        ?? ''
                    );

                return
                    str_contains(
                        $input,
                        '顧客は導入に前向き。',
                    )
                    && str_contains(
                        $input,
                        '来週までに見積書を送付する。',
                    );
            },
        );
    }

    /**
     * OpenAI APIがErrorを返した場合、
     * 内部Error詳細をClientへ公開せず502を返す。
     */
    public function test_openai_error_returns_bad_gateway(): void
    {
        Http::fake([
            'https://api.openai.com/v1/responses' => Http::response(
                [
                    'error' => [
                        'message' => 'Test OpenAI Error',
                    ],
                ],
                500,
            ),
        ]);

        $user =
            User::factory()->create();

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertStatus(502)
            ->assertExactJson([
                'message' => 'AI提案の生成に失敗しました。しばらくしてから再度お試しください。',
            ]);
    }

    /**
     * Demo Providerでは外部APIへ通信せず、
     * Meeting内容からDemo提案を返す。
     */
    public function test_demo_provider_generates_suggestion_without_external_http_request(): void
    {
        config([
            'ai.meeting.provider' => 'demo',
        ]);

        Http::fake();

        $user =
            User::factory()->create();

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'result' => '【デモ提案】初回ヒアリング：顧客から現行業務の入力作業を減らしたいという要望があった。見積書の提示を希望している。',

                    'nextAction' => '【デモ提案】商談内容を整理し、次回対応の担当・期限・実施内容を確認してください。',
                ],
            ]);

        /**
         * Demo Providerは外部AI APIを使用しない。
         *
         * 公開Portfolioで利用しても
         * OpenAI API料金が発生しないことを保証する。
         */
        Http::assertNothingSent();
    }

    /**
     * AI機能そのものを無効化した場合は503を返し、
     * Provider処理や外部API通信を実行しない。
     */
    public function test_disabled_meeting_ai_returns_service_unavailable_without_external_http_request(): void
    {
        config([
            'ai.meeting.enabled' => false,
        ]);

        Http::fake();

        $user =
            User::factory()->create();

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertStatus(503)
            ->assertExactJson([
                'message' => 'AI提案機能は現在利用できません。',
            ]);

        Http::assertNothingSent();
    }

    /**
     * 未対応Providerが設定されている場合は、
     * 内部の設定ErrorをClientへ公開せず502を返す。
     */
    public function test_unsupported_provider_returns_bad_gateway_without_external_http_request(): void
    {
        config([
            'ai.meeting.provider' => 'unsupported',
        ]);

        Http::fake();

        $user =
            User::factory()->create();

        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertStatus(502)
            ->assertExactJson([
                'message' => 'AI提案の生成に失敗しました。しばらくしてから再度お試しください。',
            ]);

        Http::assertNothingSent();
    }

    /**
     * Meeting AI提案APIはLogin User単位で
     * 1分間のRequest回数を制限する。
     *
     * Demo Providerを使用して、
     * Test中に外部AI APIへ通信しない状態で
     * Rate Limitだけを検証する。
     */
    public function test_meeting_ai_is_rate_limited_per_authenticated_user(): void
    {
        config([
            'ai.meeting.provider' => 'demo',

            'ai.meeting.rate_limit_per_minute' => 5,
        ]);

        Http::fake();

        $user =
            User::factory()->create();

        /**
         * 1〜5回目までは正常に利用できる。
         */
        for (
            $attempt = 1;
            $attempt <= 5;
            $attempt++
        ) {
            $this
                ->actingAs($user)
                ->postJson(
                    '/api/v1/meeting-ai/suggest',
                    $this->validPayload(),
                )
                ->assertOk();
        }

        /**
         * 同じUserによる6回目のRequestは、
         * Providerへ到達する前に429で拒否する。
         */
        $this
            ->actingAs($user)
            ->postJson(
                '/api/v1/meeting-ai/suggest',
                $this->validPayload(),
            )
            ->assertStatus(429)
            ->assertExactJson([
                'message' => 'AI提案の利用回数が上限に達しました。1分ほど待ってから再度お試しください。',
            ]);

        /**
         * Demo Providerなので、
         * Rate Limit Test中も外部HTTP通信は0件。
         */
        Http::assertNothingSent();
    }
}
