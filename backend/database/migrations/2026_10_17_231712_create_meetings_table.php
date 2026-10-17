<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Meeting管理用Tableを作成する。
     *
     * Meeting自身にはuser_idを持たせず、
     *
     * User
     *   ↓
     * Customer
     *   ↓
     * Project
     *   ↓
     * Meeting
     *
     * のRelationによって所有Userを判定する。
     */
    public function up(): void
    {
        Schema::create(
            'meetings',
            function (Blueprint $table): void {
                $table->id();

                /**
                 * Meetingが所属するProject。
                 *
                 * Project削除時には、
                 * 関連Meetingも削除する。
                 */
                $table
                    ->foreignId('project_id')
                    ->constrained()
                    ->cascadeOnDelete();

                /**
                 * 商談名。
                 *
                 * 例：
                 *
                 * 初回ヒアリング
                 * 見積内容確認
                 * 導入前最終打ち合わせ
                 */
                $table->string('title');

                /**
                 * 商談内容・事前情報。
                 */
                $table
                    ->text('description')
                    ->nullable();

                /**
                 * Meeting Status。
                 *
                 * scheduled
                 * completed
                 * cancelled
                 *
                 * を使用する。
                 */
                $table
                    ->string('status')
                    ->default('scheduled');

                /**
                 * 商談方法。
                 *
                 * in_person
                 * online
                 * phone
                 *
                 * を基本として使用する。
                 */
                $table
                    ->string('method')
                    ->default('in_person');

                /**
                 * 商談予定日時。
                 *
                 * Dashboardの
                 * 「今後の商談」表示にも使用する。
                 */
                $table->dateTime(
                    'scheduled_at',
                );

                /**
                 * 商談予定時間。
                 *
                 * 分単位で保持する。
                 *
                 * 例：
                 *
                 * 30
                 * 60
                 * 90
                 */
                $table
                    ->unsignedSmallInteger(
                        'duration_minutes',
                    )
                    ->nullable();

                /**
                 * 商談場所または
                 * Online Meeting情報。
                 */
                $table
                    ->string('location')
                    ->nullable();

                /**
                 * 商談結果。
                 *
                 * completed時に、
                 * 商談で決まった内容などを保存する。
                 */
                $table
                    ->text('result')
                    ->nullable();

                /**
                 * 次回対応内容。
                 *
                 * 例：
                 *
                 * ・見積書送付
                 * ・次回商談日調整
                 * ・契約書作成
                 */
                $table
                    ->text('next_action')
                    ->nullable();

                /**
                 * 商談完了日時。
                 *
                 * completed Statusへ変更した際に
                 * API側で自動設定する予定。
                 */
                $table
                    ->dateTime('completed_at')
                    ->nullable();

                $table->timestamps();

                /**
                 * Dashboardなどで、
                 *
                 * scheduled
                 * +
                 * scheduled_at
                 *
                 * を利用した検索を高速化する。
                 */
                $table->index([
                    'status',
                    'scheduled_at',
                ]);
            },
        );
    }

    /**
     * meetings Tableを削除する。
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'meetings',
        );
    }
};
