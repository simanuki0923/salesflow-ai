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

    /*
    |--------------------------------------------------------------------------
    | Demo Read Only Mode
    |--------------------------------------------------------------------------
    |
    | trueの場合、Demo UserによるCustomer / Project / Task / Meetingの
    | 登録・変更・削除を禁止する。
    |
    | 一覧・詳細・Dashboard・AI提案など、
    | Databaseを書き換えない操作は引き続き利用できる。
    |
    */

    'read_only' => env(
        'DEMO_READ_ONLY',
        true,
    ),

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
