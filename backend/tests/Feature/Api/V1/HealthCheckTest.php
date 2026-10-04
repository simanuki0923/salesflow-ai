<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

/**
 * SalesFlow AI API Health CheckのFeature Test。
 *
 * API Routerが正しく読み込まれ、
 * /api/v1 prefixでJSONを返せることを確認する。
 */
class HealthCheckTest extends TestCase
{
    /**
     * Health Check APIが
     * HTTP 200と期待するJSONを返すことを確認する。
     */
    public function test_health_check_returns_ok_response(): void
    {
        /**
         * GET /api/v1/healthへ
         * JSONリクエストを送信する。
         */
        $response = $this->getJson(
            '/api/v1/health',
        );

        /**
         * HTTP Statusが200 OKであることを確認。
         */
        $response->assertOk();

        /**
         * Response JSONが
         * 想定している内容と一致することを確認する。
         */
        $response->assertJson([
            'status' => 'ok',
            'service' => 'salesflow-ai-api',
        ]);
    }
}
