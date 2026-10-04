<?php

use Illuminate\Support\Facades\Route;

/**
 * SalesFlow AI REST API。
 *
 * routes/api.phpへ定義したRouteには
 * Laravel側で自動的に「/api」が付与される。
 *
 * そのため、このファイル内では
 *
 * /v1/health
 *
 * と定義すると、実際のURLは
 *
 * /api/v1/health
 *
 * となる。
 */
Route::prefix('v1')
    ->name('api.v1.')
    ->group(function (): void {
        /**
         * API Health Check。
         *
         * Laravel APIが正常に起動しているかを
         * Frontend・監視サービス・デプロイ環境などから
         * 確認するための最小Route。
         *
         * Customer API / Project APIは
         * 次のFeature Branchでこのv1 groupへ追加する。
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
    });
