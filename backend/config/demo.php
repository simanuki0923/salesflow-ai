<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Portfolio Demo Account
    |--------------------------------------------------------------------------
    |
    | 公開Portfolio環境で使用するDemo User設定。
    |
    | DemoPortfolioSeederから参照し、
    | Application CodeへLogin情報を直接埋め込まない。
    |
    */

    'user' => [
        'name' => env(
            'DEMO_USER_NAME',
            'SalesFlow AI Demo',
        ),

        'email' => env(
            'DEMO_USER_EMAIL',
            'demo@salesflow-ai.local',
        ),

        'password' => env(
            'DEMO_USER_PASSWORD',
            'demo-password',
        ),
    ],

];
