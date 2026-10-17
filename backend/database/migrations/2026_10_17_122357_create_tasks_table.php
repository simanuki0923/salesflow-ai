<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * tasksテーブルを作成する。
     *
     * Taskは必ず1件のProjectへ所属する。
     *
     * Project
     *   1
     *   ↓
     * Task
     *   N
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            /**
             * Primary Key。
             */
            $table->id();

            /**
             * ProjectとのForeign Key。
             *
             * Project削除時には、
             * そのProject専用Taskも削除する。
             */
            $table
                ->foreignId('project_id')
                ->constrained()
                ->cascadeOnDelete();

            /**
             * Task名。
             *
             * 例：
             * 提案資料を作成する
             */
            $table->string('title');

            /**
             * Task詳細。
             */
            $table
                ->text('description')
                ->nullable();

            /**
             * Task Status。
             *
             * todo:
             *   未着手
             *
             * in_progress:
             *   対応中
             *
             * completed:
             *   完了
             *
             * cancelled:
             *   中止
             *
             * API Validationでも
             * 同じ値のみ許可する。
             */
            $table
                ->string('status', 30)
                ->default('todo')
                ->index();

            /**
             * Task Priority。
             *
             * Projectと同じ値を使用する。
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
             * Task期限。
             *
             * 期限未設定も許可する。
             */
            $table
                ->date('due_date')
                ->nullable()
                ->index();

            /**
             * 完了日時。
             *
             * Statusがcompletedになった際に
             * API側で設定する予定。
             */
            $table
                ->timestamp('completed_at')
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
     * tasksテーブルを削除する。
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
