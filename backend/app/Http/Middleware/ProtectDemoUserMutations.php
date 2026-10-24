<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 公開Demo Accountによる
 * Database変更Requestを禁止するMiddleware。
 *
 * Demo環境では複数のPortfolio閲覧者が
 * 同じDemo Accountを利用することを想定している。
 *
 * そのため、
 *
 * ・POST
 * ・PUT
 * ・PATCH
 * ・DELETE
 *
 * を許可すると、ある閲覧者の操作によって
 * 次の閲覧者が確認するDemo Dataが
 * 変更・削除されてしまう。
 *
 * このMiddlewareではDemo Userに限り、
 * Customer / Project / Task / Meetingの
 * State-changing Requestを403で拒否する。
 *
 * GET / HEAD / OPTIONSは参照系Requestなので許可する。
 *
 * Meeting AI提案APIはDatabaseを更新しないため、
 * Route側でこのMiddlewareの対象外とする。
 */
class ProtectDemoUserMutations
{
    /**
     * Requestを検査する。
     */
    public function handle(
        Request $request,
        Closure $next,
    ): Response {
        /**
         * Demo Read Only Mode自体が無効なら
         * 通常Requestとしてそのまま通過させる。
         *
         * Local開発などでDemo Accountの編集確認を
         * 行いたい場合にも対応できる。
         */
        if (! config(
            'demo.read_only',
            true,
        )) {
            return $next($request);
        }

        /**
         * GET / HEAD / OPTIONSは
         * Databaseを書き換えないため許可する。
         */
        if (
            in_array(
                $request->method(),
                [
                    'GET',
                    'HEAD',
                    'OPTIONS',
                ],
                true,
            )
        ) {
            return $next($request);
        }

        /**
         * このMiddlewareはauth:sanctumの内側で使用するが、
         * 防御的にUser未取得の場合も通常処理へ渡す。
         *
         * Authentication自体はauth:sanctumが担当する。
         */
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        /**
         * Demo User判定には、
         * Seederと同じconfig/demo.phpのEmailを使用する。
         *
         * MiddlewareへDemo Emailを直接Hard Codingしないことで、
         * EnvironmentごとにDemo Accountを変更可能にする。
         */
        $demoEmail = trim(
            (string) config(
                'demo.user.email',
                '',
            ),
        );

        /**
         * Demo Emailが未設定なら
         * 誤って通常Userを保護対象にしない。
         */
        if ($demoEmail === '') {
            return $next($request);
        }

        /**
         * Login UserがDemo Userでなければ、
         * 従来どおりCRUDを許可する。
         */
        if (
            strcasecmp(
                (string) $user->email,
                $demoEmail,
            ) !== 0
        ) {
            return $next($request);
        }

        /**
         * Demo UserによるState-changing Requestを拒否する。
         *
         * Frontendでも後ほどButtonを無効化するが、
         * Security上の最終的な制御はBackendで行う。
         *
         * Browser UIを経由せず直接APIを呼ばれても
         * Databaseを変更できない。
         */
        return new JsonResponse(
            [
                'message' => '公開Demoアカウントではデータの登録・変更・削除はできません。',
            ],
            403,
        );
    }
}
