<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Frontendへ公開してよいUser情報だけを返す。
     *
     * password・remember_tokenなどは
     * Responseへ含めない。
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /**
         * Demo User判定にはDemoPortfolioSeederや
         * ProtectDemoUserMutationsと同じ設定値を使用する。
         *
         * EmailをApplication Codeへ直接書かないことで、
         * EnvironmentごとにDemo Accountを変更可能にする。
         */
        $demoEmail = trim(
            (string) config(
                'demo.user.email',
                '',
            ),
        );

        $isDemo =
            $demoEmail !== ''
            && strcasecmp(
                (string) $this->email,
                $demoEmail,
            ) === 0;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,

            /**
             * FrontendではEmailを再比較せず、
             * Backendが判定したDemo状態をそのまま利用する。
             */
            'isDemo' => $isDemo,

            /**
             * Demo UserかつDEMO_READ_ONLY=trueの場合だけ
             * Frontendの書き込み操作を無効化する。
             *
             * Security上の最終防御は
             * ProtectDemoUserMutationsが担当する。
             */
            'isReadOnly' => $isDemo
                && (bool) config(
                    'demo.read_only',
                    true,
                ),
        ];
    }
}
