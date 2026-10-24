<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Meeting AI
    |--------------------------------------------------------------------------
    |
    | SalesFlow AIのMeeting AI支援機能の動作設定。
    |
    | enabled:
    |   AI提案機能そのものを有効化するか。
    |
    | provider:
    |   demo:
    |     外部APIへ通信せず、無料でDemo提案を返す。
    |
    |   openai:
    |     OpenAI Responses APIを利用して提案を生成する。
    |
    | 公開Demoではdemoを利用することで、
    | OpenAI APIの継続課金を発生させずに
    | AI機能のUI・データフローを確認できる。
    |
    */

    'meeting' => [
        'enabled' => env(
            'MEETING_AI_ENABLED',
            true,
        ),

        'provider' => env(
            'AI_PROVIDER',
            'demo',
        ),

        /*
         * 1Login Userが1分間に実行できる
         * Meeting AI提案の最大回数。
         *
         * OpenAI Providerを利用するときの
         * API Cost増加や連続Requestを抑制する。
         */
        'rate_limit_per_minute' => (int) env(
            'MEETING_AI_RATE_LIMIT_PER_MINUTE',
            5,
        ),
    ],

];
