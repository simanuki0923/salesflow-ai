<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /**
         * Meeting AI提案API専用Rate Limiter。
         *
         * Login User単位で利用回数を分離し、
         *
         * User A
         *   ↓
         * 1分間に最大5回
         *
         * User B
         *   ↓
         * User Aとは別に最大5回
         *
         * として管理する。
         *
         * Demo ProviderでもRate Limitを適用することで、
         * 公開Portfolioへの過剰Requestを抑制する。
         *
         * OpenAI Providerへ切り替えた場合は、
         * API Costの急増防止にも利用できる。
         */
        RateLimiter::for(
            'meeting-ai',
            function (Request $request): Limit {
                $maxAttempts = max(
                    1,
                    (int) config(
                        'ai.meeting.rate_limit_per_minute',
                        5,
                    ),
                );

                /**
                 * auth:sanctum配下なので通常はUser IDを使用する。
                 *
                 * 念のためUserを取得できない場合は
                 * IP AddressをFallbackとして使用する。
                 */
                $key =
                    $request->user()?->id
                    ?: $request->ip();

                return Limit::perMinute(
                    $maxAttempts,
                )
                    ->by(
                        'meeting-ai:'.$key,
                    )
                    ->response(
                        function (
                            Request $request,
                            array $headers,
                        ) {
                            return response()->json(
                                [
                                    'message' => 'AI提案の利用回数が上限に達しました。1分ほど待ってから再度お試しください。',
                                ],
                                429,
                                $headers,
                            );
                        },
                    );
            },
        );
    }
}
