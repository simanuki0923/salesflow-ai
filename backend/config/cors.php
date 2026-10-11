<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Next.js FrontendからLaravel Backendへアクセスするための
    | CORS設定。
    |
    | Sanctum SPA Authenticationでは、
    | APIだけでなくCSRF Cookie・Login・Logoutでも
    | BrowserからLaravelへRequestを送信する。
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
    ],

    /*
     * GET / POST / PATCH / DELETE など、
     * APIで使用するHTTP Methodを許可する。
     */
    'allowed_methods' => ['*'],

    /*
     * Cookie認証では "*" を使用せず、
     * 許可するFrontend Originを明示する。
     *
     * ローカル開発：
     * http://localhost:3000
     *
     * 本番環境では環境変数から変更できるようにする。
     */
    'allowed_origins' => array_values(
        array_filter(
            array_map(
                'trim',
                explode(
                    ',',
                    env(
                        'CORS_ALLOWED_ORIGINS',
                        'http://localhost:3000'
                    )
                )
            )
        )
    ),

    'allowed_origins_patterns' => [],

    /*
     * JSON Content-TypeやCSRF Headerなどを許可する。
     */
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * Sanctum SPA Authenticationでは
     * Laravel Session Cookieを送受信するためtrueが必要。
     */
    'supports_credentials' => true,

];
