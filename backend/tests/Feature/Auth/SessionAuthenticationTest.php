<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SessionAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 正しいEmail / PasswordでLoginできる。
     */
    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson(
            '/login',
            [
                'email' => 'test@example.com',
                'password' => 'password',
                'remember' => false,
            ]
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.email',
                'test@example.com'
            );

        $this->assertAuthenticatedAs(
            $user
        );
    }

    /**
     * Passwordが間違っている場合はLoginできない。
     */
    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson(
            '/login',
            [
                'email' => 'test@example.com',
                'password' => 'wrong-password',
            ]
        );

        $response->assertUnprocessable();

        $this->assertGuest();
    }

    /**
     * Login中Userは/api/v1/meを取得できる。
     */
    public function test_authenticated_user_can_get_current_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->getJson(
            '/api/v1/me'
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.id',
                $user->id
            )
            ->assertJsonPath(
                'data.email',
                $user->email
            )
            ->assertJsonPath(
                'data.isDemo',
                false
            )
            ->assertJsonPath(
                'data.isReadOnly',
                false
            );
    }

    /**
     * Demo Userの場合はDemo / Read Only状態を返す。
     */
    public function test_demo_user_can_get_demo_read_only_state(): void
    {
        config([
            'demo.user.email' => 'demo@salesflow-ai.local',
            'demo.read_only' => true,
        ]);

        $user = User::factory()->create([
            'email' => 'demo@salesflow-ai.local',
        ]);

        $this->actingAs($user);

        $response = $this->getJson(
            '/api/v1/me'
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.isDemo',
                true
            )
            ->assertJsonPath(
                'data.isReadOnly',
                true
            );
    }

    /**
     * Demo UserでもRead Only設定を無効にした場合は
     * isReadOnly=falseを返す。
     */
    public function test_demo_user_can_get_disabled_read_only_state(): void
    {
        config([
            'demo.user.email' => 'demo@salesflow-ai.local',
            'demo.read_only' => false,
        ]);

        $user = User::factory()->create([
            'email' => 'demo@salesflow-ai.local',
        ]);

        $this->actingAs($user);

        $response = $this->getJson(
            '/api/v1/me'
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.isDemo',
                true
            )
            ->assertJsonPath(
                'data.isReadOnly',
                false
            );
    }

    /**
     * 未Login Userは/api/v1/meを取得できない。
     */
    public function test_guest_cannot_get_current_user(): void
    {
        $response = $this->getJson(
            '/api/v1/me'
        );

        $response->assertUnauthorized();
    }

    /**
     * Login中UserはLogoutできる。
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson(
            '/logout'
        );

        $response->assertNoContent();

        $this->assertGuest();
    }
}
