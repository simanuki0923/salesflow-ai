<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Login処理。
     *
     * Sanctum SPA認証ではPersonal Access Tokenを発行せず、
     * Laravel標準Sessionを利用する。
     */
    public function store(
        LoginRequest $request
    ): UserResource {
        $authenticated = Auth::attempt(
            $request->credentials(),
            $request->boolean('remember')
        );

        if (! $authenticated) {
            throw ValidationException::withMessages([
                'email' => [
                    'メールアドレスまたはパスワードが正しくありません。',
                ],
            ]);
        }

        /**
         * Login成功後にSession IDを再生成し、
         * Session Fixationを防止する。
         */
        $request->session()->regenerate();

        return new UserResource(
            $request->user()
        );
    }

    /**
     * Logout処理。
     */
    public function destroy(
        Request $request
    ): Response {
        Auth::guard('web')->logout();

        /**
         * 現在のSessionを無効化する。
         */
        $request->session()->invalidate();

        /**
         * CSRF Tokenも再生成する。
         */
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
