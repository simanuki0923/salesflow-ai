<?php

use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * SalesFlow AI REST API。
 *
 * Laravelによってroutes/api.phpへ
 * /api Prefixが自動付与される。
 *
 * さらにv1 Prefixを追加して、
 *
 * /api/v1/...
 *
 * へ統一する。
 */
Route::prefix('v1')
    ->name('api.v1.')
    ->group(function (): void {
        /**
         * API Health Check。
         *
         * Applicationの稼働確認に使用するため、
         * Authenticationは要求しない。
         */
        Route::get(
            '/health',
            function () {
                return response()->json([
                    'status' => 'ok',
                    'service' => 'salesflow-ai-api',
                ]);
            },
        )->name('health');

        /**
         * 現在Login中のUser情報を取得する。
         *
         * auth:sanctumによって、
         * Sanctum SPA Authenticationの
         * Session CookieからUserを認証する。
         *
         * 未認証の場合は401 Unauthorizedを返す。
         */
        Route::middleware('auth:sanctum')
            ->get(
                '/me',
                function (Request $request) {
                    return new UserResource(
                        $request->user(),
                    );
                },
            )
            ->name('me');

        /**
         * Customer REST API。
         *
         * 現段階ではまだauth:sanctumを付けない。
         *
         * Auth基盤の動作確認後、
         * 次の実装段階でLogin User単位の
         * Customer制御を追加する。
         */
        Route::apiResource(
            'customers',
            CustomerController::class,
        );

        /**
         * Project REST API。
         *
         * GET
         * POST
         * GET /{project}
         * PUT/PATCH /{project}
         * DELETE /{project}
         *
         * を生成する。
         *
         * Projectについても、
         * Auth基盤確認後にUser単位の
         * Authorizationを追加する。
         */
        Route::apiResource(
            'projects',
            ProjectController::class,
        );
    });
