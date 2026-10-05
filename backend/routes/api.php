<?php

use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\ProjectController;
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
         * Customer REST API。
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
         */
        Route::apiResource(
            'projects',
            ProjectController::class,
        );
    });
