<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TokenAuthenticationController extends Controller
{
    /**
     * Email / Passwordを検証して
     * Sanctum Personal Access Tokenを発行する。
     */
    public function store(
        LoginRequest $request
    ): JsonResponse {
        $user = User::query()
            ->where(
                'email',
                $request->string('email')->toString()
            )
            ->first();

        if (
            $user === null ||
            ! Hash::check(
                $request->string('password')->toString(),
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'メールアドレスまたはパスワードが正しくありません。',
                ],
            ]);
        }

        $token = $user->createToken(
            'salesflow-ai-web'
        );

        return response()->json([
            'data' => [
                'user' => (
                    new UserResource($user)
                )->resolve($request),

                'token' => $token->plainTextToken,
            ],
        ]);
    }

    /**
     * 現在使用しているPersonal Access Tokenだけを削除する。
     */
    public function destroy(
        Request $request
    ): Response {
        $request->user()
            ?->currentAccessToken()
            ?->delete();

        return response()->noContent();
    }
}
