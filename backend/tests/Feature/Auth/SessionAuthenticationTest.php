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
