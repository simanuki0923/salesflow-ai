<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

/**
 * Customer開発確認用Seeder。
 *
 * Next.jsで使用しているMock Dataに近いCustomerを
 * PostgreSQLへ登録する。
 *
 * これにより後ほどAPI接続するときも、
 * UI側の見た目を大きく変えずに確認できる。
 */
class CustomerSeeder extends Seeder
{
    /**
     * Customerの初期データを登録する。
     */
    public function run(): void
    {
        /**
         * 開発確認用Customer。
         *
         * 実在企業・個人情報ではなく
         * サンプルデータを使用する。
         */
        $customers = [
            [
                'user_id' => null,

                'name' => '株式会社ABC',

                'name_kana' => 'カブシキガイシャエービーシー',

                'contact_name' => '山田 太郎',

                'contact_name_kana' => 'ヤマダ タロウ',

                'email' => 'yamada@example.com',

                'phone' => '03-1234-5678',

                'postal_code' => '100-0001',

                'address' => '東京都千代田区千代田1-1',

                'industry' => 'Web・IT',

                'website' => 'https://example.com',

                'status' => 'active',

                'last_contact_date' => '2026-09-28',

                'memo' => 'Webサイト制作・システム開発を中心に継続的な相談あり。',
            ],

            [
                'user_id' => null,

                'name' => '株式会社サンプル',

                'name_kana' => 'カブシキガイシャサンプル',

                'contact_name' => '佐藤 花子',

                'contact_name_kana' => 'サトウ ハナコ',

                'email' => 'sato@example.com',

                'phone' => '03-9876-5432',

                'postal_code' => '160-0022',

                'address' => '東京都新宿区新宿1-1-1',

                'industry' => '小売',

                'website' => null,

                'status' => 'active',

                'last_contact_date' => '2026-09-27',

                'memo' => 'ECサイト関連の相談を継続中。',
            ],

            [
                'user_id' => null,

                'name' => '合同会社テスト',

                'name_kana' => 'ゴウドウガイシャテスト',

                'contact_name' => '鈴木 一郎',

                'contact_name_kana' => 'スズキ イチロウ',

                'email' => 'suzuki@example.com',

                'phone' => '045-123-4567',

                'postal_code' => '220-0011',

                'address' => '神奈川県横浜市西区1-1-1',

                'industry' => 'サービス',

                'website' => null,

                'status' => 'active',

                'last_contact_date' => '2026-09-25',

                'memo' => null,
            ],

            [
                'user_id' => null,

                'name' => 'デザイン株式会社',

                'name_kana' => 'デザインカブシキガイシャ',

                'contact_name' => '高橋 美咲',

                'contact_name_kana' => 'タカハシ ミサキ',

                'email' => 'takahashi@example.com',

                'phone' => '048-111-2222',

                'postal_code' => '330-0000',

                'address' => '埼玉県さいたま市1-1-1',

                'industry' => 'デザイン',

                'website' => null,

                'status' => 'active',

                'last_contact_date' => '2026-09-22',

                'memo' => null,
            ],

            [
                'user_id' => null,

                'name' => 'システム開発株式会社',

                'name_kana' => 'システムカイハツカブシキガイシャ',

                'contact_name' => '田中 健',

                'contact_name_kana' => 'タナカ ケン',

                'email' => 'tanaka@example.com',

                'phone' => '042-555-1234',

                'postal_code' => '190-0000',

                'address' => '東京都立川市1-1-1',

                'industry' => 'システム開発',

                'website' => null,

                'status' => 'active',

                'last_contact_date' => '2026-09-20',

                'memo' => null,
            ],
        ];

        /**
         * updateOrCreate()を使う理由。
         *
         * Seederを複数回実行しても、
         * 同じメールアドレスのCustomerが
         * 無限に増えないようにする。
         *
         * emailが一致：
         *   UPDATE
         *
         * emailが存在しない：
         *   INSERT
         */
        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                [
                    'email' => $customer['email'],
                ],
                $customer,
            );
        }
    }
}
