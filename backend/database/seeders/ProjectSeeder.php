<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Project開発確認用Seeder。
 *
 * Next.jsで使用してきたMock案件に近いデータを
 * PostgreSQLへ登録する。
 *
 * CustomerとのRelationも同時に確認できるようにする。
 */
class ProjectSeeder extends Seeder
{
    /**
     * Project初期データを登録する。
     */
    public function run(): void
    {
        /**
         * Customerをemailで取得する。
         *
         * IDを「1」などで固定すると、
         * DB再構築時のAuto Increment状況によって
         * Relationが壊れる可能性がある。
         *
         * そのためSeederではCustomer固有の
         * サンプルemailからCustomerを取得する。
         */
        $abc = Customer::where(
            'email',
            'yamada@example.com',
        )->firstOrFail();

        $sample = Customer::where(
            'email',
            'sato@example.com',
        )->firstOrFail();

        $test = Customer::where(
            'email',
            'suzuki@example.com',
        )->firstOrFail();

        $design = Customer::where(
            'email',
            'takahashi@example.com',
        )->firstOrFail();

        $system = Customer::where(
            'email',
            'tanaka@example.com',
        )->firstOrFail();

        /**
         * 開発確認用案件データ。
         *
         * customerにはEloquent Modelそのものを保持しておき、
         * 登録時にcustomer_idへ変換する。
         */
        $projects = [
            [
                'customer' => $abc,

                'name' => 'コーポレートサイトリニューアル',

                'type' => 'Webサイト制作',

                'owner_name' => '山田 太郎',

                'status' => 'in_progress',

                'priority' => 'high',

                'amount' => 550000,

                'start_date' => '2026-09-01',

                'due_date' => '2026-11-30',

                'progress' => 65,

                'description' => '既存コーポレートサイトのデザイン・情報構成を見直すリニューアル案件です。',

                'notes' => 'トップページ確認後に下層ページ制作へ進む予定。',
            ],

            [
                'customer' => $abc,

                'name' => '採用サイト制作',

                'type' => '採用サイト',

                'owner_name' => '佐藤 花子',

                'status' => 'proposal',

                'priority' => 'medium',

                'amount' => 320000,

                'start_date' => '2026-10-01',

                'due_date' => '2026-12-20',

                'progress' => 20,

                'description' => '採用強化を目的とした採用サイト制作案件です。',

                'notes' => null,
            ],

            [
                'customer' => $sample,

                'name' => 'ECサイト改善',

                'type' => 'ECサイト',

                'owner_name' => '山田 太郎',

                'status' => 'in_progress',

                'priority' => 'high',

                'amount' => 420000,

                'start_date' => '2026-09-15',

                'due_date' => '2026-12-10',

                'progress' => 45,

                'description' => 'ECサイトの購入導線と商品ページを改善する案件です。',

                'notes' => null,
            ],

            [
                'customer' => $sample,

                'name' => 'キャンペーンLP制作',

                'type' => 'LP制作',

                'owner_name' => '佐藤 花子',

                'status' => 'completed',

                'priority' => 'medium',

                'amount' => 150000,

                'start_date' => '2026-08-01',

                'due_date' => '2026-09-15',

                'progress' => 100,

                'description' => 'キャンペーン用ランディングページ制作案件です。',

                'notes' => null,
            ],

            [
                'customer' => $test,

                'name' => '顧客管理システム開発',

                'type' => 'システム開発',

                'owner_name' => '山田 太郎',

                'status' => 'negotiation',

                'priority' => 'high',

                'amount' => 980000,

                'start_date' => '2026-10-15',

                'due_date' => '2027-01-31',

                'progress' => 10,

                'description' => '顧客情報・案件情報を管理する業務システム開発案件です。',

                'notes' => null,
            ],

            [
                'customer' => $design,

                'name' => '会社案内ページ制作',

                'type' => 'Webサイト制作',

                'owner_name' => '佐藤 花子',

                'status' => 'draft',

                'priority' => 'low',

                'amount' => 180000,

                'start_date' => '2026-11-01',

                'due_date' => '2026-12-15',

                'progress' => 0,

                'description' => '会社概要・サービス紹介を掲載するページ制作案件です。',

                'notes' => null,
            ],

            [
                'customer' => $system,

                'name' => '業務システム改修',

                'type' => 'システム改修',

                'owner_name' => '山田 太郎',

                'status' => 'in_progress',

                'priority' => 'medium',

                'amount' => 680000,

                'start_date' => '2026-09-10',

                'due_date' => '2026-11-15',

                'progress' => 75,

                'description' => '既存業務システムの機能追加・改善案件です。',

                'notes' => '既存機能への影響を確認しながら段階的に改修する。',
            ],
        ];

        /**
         * Projectを登録する。
         *
         * updateOrCreate()を使用することで、
         * Seederを複数回実行しても
         * 同じ顧客・案件名のレコードが増殖しないようにする。
         */
        foreach ($projects as $project) {
            /**
             * Seeder内部だけで使用した
             * Customer Modelを取り出す。
             */
            $customer = $project['customer'];

            unset($project['customer']);

            Project::updateOrCreate(
                [
                    'customer_id' => $customer->id,

                    'name' => $project['name'],
                ],
                [
                    ...$project,

                    'customer_id' => $customer->id,
                ],
            );
        }
    }
}
