<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TokenAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 正しいEmail / Passwordで
     * Personal Access Tokenを取得できる。
     */
    public function test_user_can_login_with_token_authentication(): void
    {
        User::factory()->create([
            'email' => 'token@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson(
            '/api/v1/auth/login',
            [
                'email' => 'token@example.com',
                'password' => 'password',
            ]
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.user.email',
                'token@example.com'
            )
            ->assertJsonStructure([
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'isDemo',
                        'isReadOnly',
                    ],
                    'token',
                ],
            ]);

        $this->assertDatabaseCount(
            'personal_access_tokens',
            1
        );
    }

    /**
     * Passwordが間違っている場合は
     * Tokenを発行しない。
     */
    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'token@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson(
            '/api/v1/auth/login',
            [
                'email' => 'token@example.com',
                'password' => 'wrong-password',
            ]
        );

        $response->assertUnprocessable();

        $this->assertDatabaseCount(
            'personal_access_tokens',
            0
        );
    }

    /**
     * Bearer Tokenで/api/v1/meへアクセスできる。
     */
    public function test_user_can_access_api_with_bearer_token(): void
    {
        $user = User::factory()->create();

        $token = $user->createToken(
            'test-token'
        )->plainTextToken;

        $response = $this
            ->withToken($token)
            ->getJson('/api/v1/me');

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.id',
                $user->id
            )
            ->assertJsonPath(
                'data.email',
                $user->email
            );
    }

    /**
     * Logoutすると現在使用中のTokenだけを削除する。
     */
    public function test_user_can_logout_and_revoke_current_token(): void
    {
        $user = User::factory()->create();

        $currentToken = $user->createToken(
            'current-token'
        )->plainTextToken;

        $user->createToken(
            'other-token'
        );

        $response = $this
            ->withToken($currentToken)
            ->postJson(
                '/api/v1/auth/logout'
            );

        $response->assertNoContent();

        $this->assertDatabaseCount(
            'personal_access_tokens',
            1
        );

        /**
         * 同一Feature Test内では直前Requestの
         * Authentication Guardが残る可能性があるため、
         * Token失効後のRequest前にGuardを初期化する。
         */
        Auth::forgetGuards();

        $this
            ->withToken($currentToken)
            ->getJson('/api/v1/me')
            ->assertUnauthorized();
    }
}
