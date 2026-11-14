<?php

use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MeetingAiSuggestionController;
use App\Http\Controllers\Api\V1\MeetingController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\TokenAuthenticationController;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * SalesFlow AI REST API。
 *
 * routes/api.php にはLaravelによって
 * /api Prefixが自動付与される。
 *
 * さらにv1 Prefixを追加し、
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
         * Applicationの稼働確認用なので
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
         * Bearer Token Login。
         *
         * Vercel / RailwayのようにFrontendとBackendが
         * 異なるDomainで稼働するProduction環境向け。
         */
        Route::post(
            '/auth/login',
            [
                TokenAuthenticationController::class,
                'store',
            ],
        )->name('auth.login');

        /**
         * ここから下のAPIはLogin必須。
         *
         * Sanctum SPA Authenticationによる
         * Session Cookieを使用してUserを認証する。
         */
        Route::middleware('auth:sanctum')
            ->group(function (): void {
                /**
                 * 現在使用中のBearer Tokenを無効化する。
                 */
                Route::post(
                    '/auth/logout',
                    [
                        TokenAuthenticationController::class,
                        'destroy',
                    ],
                )->name('auth.logout');

                /**
                 * 現在Login中のUser情報。
                 */
                Route::get(
                    '/me',
                    function (Request $request) {
                        return new UserResource(
                            $request->user(),
                        );
                    },
                )->name('me');

                /**
                 * Dashboard API。
                 *
                 * Login Userが所有するCustomer / Projectを
                 * Dashboard表示用に集計して返す。
                 */
                Route::get(
                    '/dashboard',
                    DashboardController::class,
                )->name('dashboard');

                /**
                 * Customer REST API。
                 */
                Route::apiResource(
                    'customers',
                    CustomerController::class,
                )->middleware(
                    'demo.read-only',
                );

                /**
                 * Project REST API。
                 */
                Route::apiResource(
                    'projects',
                    ProjectController::class,
                )->middleware(
                    'demo.read-only',
                );

                /**
                 * Task REST API。
                 */
                Route::apiResource(
                    'tasks',
                    TaskController::class,
                )->middleware(
                    'demo.read-only',
                );

                /**
                 * Meeting AI営業支援API。
                 *
                 * AIは提案だけを返し、
                 * Meeting自体は保存・更新しない。
                 */
                Route::post(
                    '/meeting-ai/suggest',
                    MeetingAiSuggestionController::class,
                )
                    ->middleware(
                        'throttle:meeting-ai',
                    )
                    ->name(
                        'meeting-ai.suggest',
                    );

                /**
                 * Meeting REST API。
                 */
                Route::apiResource(
                    'meetings',
                    MeetingController::class,
                )->middleware(
                    'demo.read-only',
                );
            });
    });
