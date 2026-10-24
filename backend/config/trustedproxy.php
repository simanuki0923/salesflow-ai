<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Trusted Proxies
    |--------------------------------------------------------------------------
    |
    | Cloud ProviderのReverse Proxy配下でLaravelを動作させる場合に、
    | 信頼するProxyをEnvironment Variableから指定する。
    |
    | Local:
    |   未設定
    |
    | Railway等:
    |   TRUSTED_PROXIES=*
    |
    */

    'proxies' => env('TRUSTED_PROXIES'),

];
