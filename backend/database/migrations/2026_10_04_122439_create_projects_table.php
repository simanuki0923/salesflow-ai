<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * projectsテーブルを作成する。
     *
     * Projectは必ず1件のCustomerへ所属する。
     *
     * Customer
     *   1
     *   ↓
     * Project
     *   N
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            /**
             * Primary Key。
             *
             * Laravel標準のBIGINT Auto Increment ID。
             */
            $table->id();

            /**
             * CustomerとのForeign Key。
             *
             * customer_id
             *   ↓
             * customers.id
             *
             * constrained()によりLaravelの命名規則から
             * customersテーブルを自動判定する。
             *
             * restrictOnDelete()により、
             * Projectが存在するCustomerをDBレベルで
             * 誤って削除できないようにする。
             */
            $table
                ->foreignId('customer_id')
                ->constrained()
                ->restrictOnDelete();

            /**
             * 案件名。
             *
             * 例：
             * コーポレートサイトリニューアル
             */
            $table->string('name');

            /**
             * 案件種別。
             *
             * 例：
             * Webサイト制作
             * ECサイト
             * システム開発
             */
            $table
                ->string('type', 100)
                ->nullable();

            /**
             * SalesFlow AI上の案件担当者。
             *
             * 現段階ではUser Relationにはせず、
             * 担当者名を文字列で保持する。
             *
             * 認証・ユーザー管理を拡張する段階で
             * user_id化を検討できる。
             */
            $table->string('owner_name');

            /**
             * 案件ステータス。
             *
             * draft:
             *   下書き
             *
             * proposal:
             *   提案中
             *
             * negotiation:
             *   商談中
             *
             * in_progress:
             *   進行中
             *
             * completed:
             *   完了
             *
             * cancelled:
             *   中止
             *
             * Laravel API実装時のValidationでも
             * 同じ値だけを許可する。
             */
            $table
                ->string('status', 30)
                ->default('draft')
                ->index();

            /**
             * 案件優先度。
             *
             * high:
             *   高
             *
             * medium:
             *   中
             *
             * low:
             *   低
             */
            $table
                ->string('priority', 20)
                ->default('medium')
                ->index();

            /**
             * 案件金額。
             *
             * PostgreSQLにはMySQLのようなunsigned整数型が
             * ないためbigIntegerとして保持する。
             *
             * 0以上という制約は後のAPI Validationでも行う。
             */
            $table
                ->bigInteger('amount')
                ->default(0);

            /**
             * 案件開始日。
             *
             * 時刻までは不要なためdate型。
             */
            $table->date('start_date');

            /**
             * 案件期限。
             */
            $table->date('due_date');

            /**
             * 案件進捗率。
             *
             * 0〜100を想定。
             *
             * API Validation実装時にも
             * 0〜100へ制限する。
             */
            $table
                ->smallInteger('progress')
                ->default(0);

            /**
             * 案件概要。
             */
            $table
                ->text('description')
                ->nullable();

            /**
             * 社内用補足メモ。
             */
            $table
                ->text('notes')
                ->nullable();

            /**
             * created_at
             * updated_at
             */
            $table->timestamps();
        });
    }

    /**
     * MigrationをRollbackした場合に
     * projectsテーブルを削除する。
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
