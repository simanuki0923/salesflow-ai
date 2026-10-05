<?php

use App\Http\Controllers\Api\V1\CustomerController;
use Illuminate\Support\Facades\Route;

/**
 * SalesFlow AI REST API。
 *
 * routes/api.phpにはLaravelによって
 * /api Prefixが自動付与される。
 *
 * このv1 Groupによって、
 *
 * /api/v1/...
 *
 * というURL構成になる。
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
         *
         * apiResource()により、
         *
         * GET    /customers
         * POST   /customers
         * GET    /customers/{customer}
         * PUT    /customers/{customer}
         * PATCH  /customers/{customer}
         * DELETE /customers/{customer}
         *
         * がまとめて作成される。
         */
        Route::apiResource(
            'customers',
            CustomerController::class,
        );
    });
