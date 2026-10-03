<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * customersテーブルを作成する。
     *
     * Next.js側で作成済みのCustomer型と
     * Laravel / PostgreSQLのデータ構造を対応させる。
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            /**
             * Primary Key。
             *
             * BIGINTのAuto Increment IDが作成される。
             */
            $table->id();

            /**
             * 将来的にSanctum認証を実装した際、
             * どのユーザーが管理するCustomerなのかを
             * 判断するためのForeign Key。
             *
             * 現段階では認証未実装のためnullableにしておく。
             *
             * Userが削除された場合、
             * Customer自体は残しuser_idだけNULLにする。
             */
            $table
                ->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /**
             * 顧客名・会社名。
             *
             * 例：
             * 株式会社ABC
             */
            $table->string('name');

            /**
             * 顧客名カナ。
             *
             * 任意入力なのでNULLを許可する。
             */
            $table
                ->string('name_kana')
                ->nullable();

            /**
             * 顧客側担当者。
             */
            $table->string('contact_name');

            /**
             * 担当者名カナ。
             */
            $table
                ->string('contact_name_kana')
                ->nullable();

            /**
             * メールアドレス。
             *
             * 今回はCustomerそのものを識別する
             * Login IDではないためuniqueにはしない。
             */
            $table->string('email');

            /**
             * 電話番号。
             *
             * ハイフン等も含むため
             * 数値ではなく文字列として保存する。
             */
            $table
                ->string('phone', 50)
                ->nullable();

            /**
             * 郵便番号。
             *
             * ハイフンを保持するためstring。
             */
            $table
                ->string('postal_code', 20)
                ->nullable();

            /**
             * 所在地。
             */
            $table
                ->string('address')
                ->nullable();

            /**
             * 業種。
             */
            $table
                ->string('industry', 100)
                ->nullable();

            /**
             * WebサイトURL。
             *
             * URLが長くなる場合を考慮して
             * 2048文字まで保持可能にする。
             */
            $table
                ->string('website', 2048)
                ->nullable();

            /**
             * 顧客状態。
             *
             * active:
             *   取引中
             *
             * inactive:
             *   取引停止
             *
             * API Validationでも同じ値に制限する予定。
             */
            $table
                ->string('status', 20)
                ->default('active')
                ->index();

            /**
             * 最終対応日。
             *
             * 時刻までは不要なのでdate型とする。
             */
            $table
                ->date('last_contact_date')
                ->nullable()
                ->index();

            /**
             * 顧客に関する自由記述メモ。
             */
            $table
                ->text('memo')
                ->nullable();

            /**
             * created_at
             * updated_at
             *
             * を自動作成する。
             */
            $table->timestamps();
        });
    }

    /**
     * MigrationをRollbackした場合に
     * customersテーブルを削除する。
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
