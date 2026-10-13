<?php

use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ProjectController;
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
         * ここから下のAPIはLogin必須。
         *
         * Sanctum SPA Authenticationによる
         * Session Cookieを使用してUserを認証する。
         */
        Route::middleware('auth:sanctum')
            ->group(function (): void {
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
                );

                /**
                 * Project REST API。
                 */
                Route::apiResource(
                    'projects',
                    ProjectController::class,
                );
            });
    });
