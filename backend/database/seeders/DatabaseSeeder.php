<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * アプリケーション全体の初期データを登録するSeeder。
 *
 * Customer → Projectの順番には意味がある。
 *
 * Projectはcustomer_idによってCustomerを参照するため、
 * Customerを先に作成しておく必要がある。
 */
class DatabaseSeeder extends Seeder
{
    /**
     * 開発確認用データを登録する。
     */
    public function run(): void
    {
        /**
         * 開発確認用ユーザー。
         *
         * create()ではなくfirstOrCreate()を使用する。
         *
         * create():
         *   Seederを実行するたびにINSERTするため、
         *   同じemailが存在するとUNIQUE制約違反になる。
         *
         * firstOrCreate():
         *   test@example.comが存在すれば既存Userを使用し、
         *   存在しなければ新規登録する。
         *
         * そのため、
         *
         * php artisan db:seed
         *
         * を複数回実行してもUserが重複しない。
         */
        User::firstOrCreate(
            [
                'email' => 'test@example.com',
            ],
            [
                'name' => 'Test User',

                /**
                 * 将来Sanctum認証を実装した際にも
                 * 利用できる開発確認用Password。
                 *
                 * 平文のままDBへ保存せず、
                 * LaravelのHashで暗号化する。
                 */
                'password' => Hash::make('password'),
            ],
        );

        /**
         * Seederの実行順。
         *
         * Customer
         *     ↓
         * Project
         *
         * ProjectはCustomerを必要とするため、
         * 必ずCustomerSeederを先に実行する。
         */
        $this->call([
            CustomerSeeder::class,
            ProjectSeeder::class,
        ]);
    }
}
