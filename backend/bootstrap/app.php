<?php

use App\Http\Middleware\ProtectDemoUserMutations;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /**
         * Laravel Sanctum の SPA 認証を有効化する。
         *
         * Next.js などの First-party SPA から送信される
         * Laravel Session Cookie を API 認証でも利用できるようにする。
         *
         * これにより auth:sanctum を付けた API Route で、
         * Personal Access Token ではなく
         * Session Cookie を使って User を認証できる。
         */
        $middleware->statefulApi();

        /**
         * 公開Demo Userによる
         * Customer / Project / Task / Meetingの
         * Database変更Requestを禁止するMiddleware。
         *
         * Routeでは短いAlias名で利用する。
         */
        $middleware->alias([
            'demo.read-only' => ProtectDemoUserMutations::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /**
         * API Request または JSON を期待している Request では、
         * HTML Error Page ではなく JSON Response を返す。
         */
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })
    ->create();
