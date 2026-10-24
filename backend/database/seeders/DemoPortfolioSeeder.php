<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * SalesFlow AI公開Portfolio用Demo Data Seeder。
 *
 * 通常のDatabaseSeederとは分離し、
 *
 * php artisan db:seed --class=DemoPortfolioSeeder
 *
 * と明示的に実行した場合だけDemo Dataを登録する。
 *
 * updateOrCreate()を使用することで、
 * 同じSeederを複数回実行しても
 * 同一Demo Dataが重複しにくい構成にする。
 */
class DemoPortfolioSeeder extends Seeder
{
    /**
     * Demo Accountと営業活動データを登録する。
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = $this->createDemoUser();

            $customers =
                $this->createCustomers(
                    $user,
                );

            $projects =
                $this->createProjects(
                    $customers,
                );

            $this->createTasks(
                $projects,
            );

            $this->createMeetings(
                $projects,
            );
        });
    }

    /**
     * 公開Demo用Login Userを作成する。
     */
    private function createDemoUser(): User
    {
        $email = trim(
            (string) config(
                'demo.user.email',
            ),
        );

        $password = (string) config(
            'demo.user.password',
        );

        $user = User::updateOrCreate(
            [
                'email' => $email,
            ],
            [
                'name' => (string) config(
                    'demo.user.name',
                ),

                'password' => Hash::make(
                    $password,
                ),
            ],
        );

        /**
         * Demo UserはLogin確認用Accountなので、
         * Email Verified状態にしておく。
         *
         * email_verified_atはUserのfillable対象外のため、
         * forceFill()を使用する。
         */
        if ($user->email_verified_at === null) {
            $user
                ->forceFill([
                    'email_verified_at' => now(),
                ])
                ->save();
        }

        return $user;
    }

    /**
     * Demo Customerを作成する。
     *
     * @return array<string, Customer>
     */
    private function createCustomers(
        User $user,
    ): array {
        $today = today();

        $customers = [
            'aosora' => [
                'name' => '株式会社青空テクノロジー',
                'name_kana' => 'カブシキガイシャアオゾラテクノロジー',
                'contact_name' => '佐藤 太郎',
                'contact_name_kana' => 'サトウ タロウ',
                'email' => 'sato@example.com',
                'phone' => '03-1234-5678',
                'postal_code' => '100-0001',
                'address' => '東京都千代田区千代田1-1',
                'industry' => 'IT・システム開発',
                'website' => 'https://example.com',
                'status' => 'active',
                'last_contact_date' => $today
                    ->copy()
                    ->subDay(),
                'memo' => '営業管理業務の効率化を検討しているDemo Customer。',
            ],

            'toto' => [
                'name' => '東都物流株式会社',
                'name_kana' => 'トウトブツリュウカブシキガイシャ',
                'contact_name' => '鈴木 花子',
                'contact_name_kana' => 'スズキ ハナコ',
                'email' => 'suzuki@example.com',
                'phone' => '045-234-5678',
                'postal_code' => '220-0001',
                'address' => '神奈川県横浜市西区1-1',
                'industry' => '物流',
                'website' => null,
                'status' => 'active',
                'last_contact_date' => $today
                    ->copy()
                    ->subDays(3),
                'memo' => '配送業務のDX化を検討しているDemo Customer。',
            ],

            'green' => [
                'name' => 'グリーンフーズ株式会社',
                'name_kana' => 'グリーンフーズカブシキガイシャ',
                'contact_name' => '高橋 健一',
                'contact_name_kana' => 'タカハシ ケンイチ',
                'email' => 'takahashi@example.com',
                'phone' => '048-345-6789',
                'postal_code' => '330-0001',
                'address' => '埼玉県さいたま市1-1',
                'industry' => '食品',
                'website' => null,
                'status' => 'inactive',
                'last_contact_date' => $today
                    ->copy()
                    ->subDays(20),
                'memo' => '過去案件の確認用Demo Customer。',
            ],
        ];

        $created = [];

        foreach (
            $customers as $key => $attributes
        ) {
            $created[$key] =
                Customer::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'email' => $attributes['email'],
                    ],
                    [
                        'user_id' => $user->id,
                        ...$attributes,
                    ],
                );
        }

        return $created;
    }

    /**
     * Demo Projectを作成する。
     *
     * @param  array<string, Customer>  $customers
     * @return array<string, Project>
     */
    private function createProjects(
        array $customers,
    ): array {
        $today = today();

        $projects = [
            'sales-system' => [
                'customer' => $customers['aosora'],
                'name' => '営業管理システム導入',
                'type' => 'システム導入',
                'owner_name' => 'Demo Sales',
                'status' => 'negotiation',
                'priority' => 'high',
                'amount' => 2400000,
                'start_date' => $today
                    ->copy()
                    ->subDays(14),
                'due_date' => $today
                    ->copy()
                    ->addDays(30),
                'progress' => 45,
                'description' => '営業情報の一元管理と入力作業削減を目的としたシステム導入案件。',
                'notes' => 'Meeting AI Demoを確認できる主要案件。',
            ],

            'portal' => [
                'customer' => $customers['aosora'],
                'name' => '顧客ポータル改善',
                'type' => 'Webシステム改善',
                'owner_name' => 'Demo Sales',
                'status' => 'proposal',
                'priority' => 'medium',
                'amount' => 1200000,
                'start_date' => $today
                    ->copy()
                    ->subDays(5),
                'due_date' => $today
                    ->copy()
                    ->addDays(45),
                'progress' => 20,
                'description' => '既存顧客ポータルの操作性改善案件。',
                'notes' => null,
            ],

            'logistics-dx' => [
                'customer' => $customers['toto'],
                'name' => '配送業務DX支援',
                'type' => '業務改善',
                'owner_name' => 'Demo Sales',
                'status' => 'in_progress',
                'priority' => 'high',
                'amount' => 3600000,
                'start_date' => $today
                    ->copy()
                    ->subDays(45),
                'due_date' => $today
                    ->copy()
                    ->addDays(20),
                'progress' => 70,
                'description' => '配送計画・実績管理業務のデジタル化支援。',
                'notes' => '導入日程の最終調整中。',
            ],

            'order-system' => [
                'customer' => $customers['green'],
                'name' => '受発注システム刷新',
                'type' => 'システム開発',
                'owner_name' => 'Demo Sales',
                'status' => 'completed',
                'priority' => 'medium',
                'amount' => 1800000,
                'start_date' => $today
                    ->copy()
                    ->subDays(90),
                'due_date' => $today
                    ->copy()
                    ->subDays(10),
                'progress' => 100,
                'description' => '既存受発注システムの刷新案件。',
                'notes' => 'Demo用完了案件。',
            ],
        ];

        $created = [];

        foreach (
            $projects as $key => $attributes
        ) {
            /** @var Customer $customer */
            $customer =
                $attributes['customer'];

            unset(
                $attributes['customer'],
            );

            $created[$key] =
                Project::updateOrCreate(
                    [
                        'customer_id' => $customer->id,
                        'name' => $attributes['name'],
                    ],
                    [
                        'customer_id' => $customer->id,
                        ...$attributes,
                    ],
                );
        }

        return $created;
    }

    /**
     * Demo Taskを作成する。
     *
     * @param  array<string, Project>  $projects
     */
    private function createTasks(
        array $projects,
    ): void {
        $today = today();
        $now = now();

        $tasks = [
            [
                'project' => $projects['sales-system'],
                'title' => '見積書を更新する',
                'description' => 'ヒアリング内容を反映して見積書を更新する。',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => $today
                    ->copy()
                    ->addDays(2),
                'completed_at' => null,
            ],
            [
                'project' => $projects['sales-system'],
                'title' => '提案資料を送付する',
                'description' => '更新した提案資料を顧客担当者へ送付する。',
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => $today
                    ->copy()
                    ->addDays(4),
                'completed_at' => null,
            ],
            [
                'project' => $projects['sales-system'],
                'title' => '初回要件ヒアリング内容を整理する',
                'description' => '初回商談で確認した要件を整理する。',
                'status' => 'completed',
                'priority' => 'medium',
                'due_date' => $today
                    ->copy()
                    ->subDay(),
                'completed_at' => $now
                    ->copy()
                    ->subDay(),
            ],
            [
                'project' => $projects['portal'],
                'title' => '現行画面の課題を整理する',
                'description' => '既存画面の操作上の課題を一覧化する。',
                'status' => 'todo',
                'priority' => 'low',
                'due_date' => $today
                    ->copy()
                    ->addDays(7),
                'completed_at' => null,
            ],
            [
                'project' => $projects['logistics-dx'],
                'title' => '導入スケジュールを確定する',
                'description' => '顧客と最終導入日程を調整する。',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => $today
                    ->copy()
                    ->addDays(3),
                'completed_at' => null,
            ],
            [
                'project' => $projects['logistics-dx'],
                'title' => '操作説明資料を準備する',
                'description' => '導入時に利用する操作説明資料を準備する。',
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => $today
                    ->copy()
                    ->addDays(10),
                'completed_at' => null,
            ],
            [
                'project' => $projects['order-system'],
                'title' => '完了報告書を送付する',
                'description' => '案件完了報告書を顧客へ送付する。',
                'status' => 'completed',
                'priority' => 'low',
                'due_date' => $today
                    ->copy()
                    ->subDays(8),
                'completed_at' => $now
                    ->copy()
                    ->subDays(8),
            ],
        ];

        foreach ($tasks as $attributes) {
            /** @var Project $project */
            $project =
                $attributes['project'];

            unset(
                $attributes['project'],
            );

            Task::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'title' => $attributes['title'],
                ],
                [
                    'project_id' => $project->id,
                    ...$attributes,
                ],
            );
        }
    }

    /**
     * Demo Meetingを作成する。
     *
     * 過去・今後・完了・予定・中止を混在させ、
     * DashboardやMeeting一覧を確認できるDataにする。
     *
     * @param  array<string, Project>  $projects
     */
    private function createMeetings(
        array $projects,
    ): void {
        $now = now();

        $meetings = [
            [
                'project' => $projects['sales-system'],
                'title' => '初回ヒアリング',
                'description' => '顧客から現行業務の入力作業を減らしたいという要望があった。見積内容と導入スケジュールの提示を希望している。',
                'status' => 'completed',
                'method' => 'online',
                'scheduled_at' => $now
                    ->copy()
                    ->subDays(7)
                    ->setTime(10, 0),
                'duration_minutes' => 60,
                'location' => 'オンライン会議',
                'result' => '現行業務の入力負荷が高く、営業情報を一元管理したい要望を確認した。',
                'next_action' => '要望を整理した見積書と導入スケジュール案を作成する。',
                'completed_at' => $now
                    ->copy()
                    ->subDays(7)
                    ->setTime(11, 0),
            ],
            [
                'project' => $projects['sales-system'],
                'title' => '見積内容確認',
                'description' => '見積金額・導入範囲・スケジュールについて顧客と確認する。',
                'status' => 'scheduled',
                'method' => 'in_person',
                'scheduled_at' => $now
                    ->copy()
                    ->addDays(2)
                    ->setTime(14, 0),
                'duration_minutes' => 60,
                'location' => '顧客本社会議室',
                'result' => null,
                'next_action' => null,
                'completed_at' => null,
            ],
            [
                'project' => $projects['sales-system'],
                'title' => '導入条件確認',
                'description' => '導入条件と初期設定の進め方を確認する。',
                'status' => 'scheduled',
                'method' => 'online',
                'scheduled_at' => $now
                    ->copy()
                    ->addDays(7)
                    ->setTime(11, 0),
                'duration_minutes' => 45,
                'location' => 'オンライン会議',
                'result' => null,
                'next_action' => null,
                'completed_at' => null,
            ],
            [
                'project' => $projects['portal'],
                'title' => '要件整理ミーティング',
                'description' => '既存画面の課題と改善要望を整理する。',
                'status' => 'scheduled',
                'method' => 'phone',
                'scheduled_at' => $now
                    ->copy()
                    ->addDays(4)
                    ->setTime(15, 0),
                'duration_minutes' => 30,
                'location' => null,
                'result' => null,
                'next_action' => null,
                'completed_at' => null,
            ],
            [
                'project' => $projects['logistics-dx'],
                'title' => '進捗確認',
                'description' => '導入準備状況と残課題を確認する。',
                'status' => 'completed',
                'method' => 'in_person',
                'scheduled_at' => $now
                    ->copy()
                    ->subDays(3)
                    ->setTime(13, 30),
                'duration_minutes' => 60,
                'location' => '東都物流株式会社 会議室',
                'result' => '主要な設定作業は完了し、導入日程の最終調整へ進むことになった。',
                'next_action' => '導入日を確定し、操作説明資料を事前送付する。',
                'completed_at' => $now
                    ->copy()
                    ->subDays(3)
                    ->setTime(14, 30),
            ],
            [
                'project' => $projects['logistics-dx'],
                'title' => '導入日程調整',
                'description' => '本番導入日と当日の作業スケジュールを確定する。',
                'status' => 'scheduled',
                'method' => 'online',
                'scheduled_at' => $now
                    ->copy()
                    ->addDay()
                    ->setTime(16, 0),
                'duration_minutes' => 45,
                'location' => 'オンライン会議',
                'result' => null,
                'next_action' => null,
                'completed_at' => null,
            ],
            [
                'project' => $projects['order-system'],
                'title' => '最終レビュー',
                'description' => '案件完了前の最終確認Meeting。',
                'status' => 'cancelled',
                'method' => 'online',
                'scheduled_at' => $now
                    ->copy()
                    ->subDays(12)
                    ->setTime(11, 0),
                'duration_minutes' => 60,
                'location' => 'オンライン会議',
                'result' => null,
                'next_action' => null,
                'completed_at' => null,
            ],
        ];

        foreach ($meetings as $attributes) {
            /** @var Project $project */
            $project =
                $attributes['project'];

            unset(
                $attributes['project'],
            );

            Meeting::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'title' => $attributes['title'],
                ],
                [
                    'project_id' => $project->id,
                    ...$attributes,
                ],
            );
        }
    }
}
