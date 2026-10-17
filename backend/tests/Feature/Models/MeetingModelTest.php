<?php

namespace Tests\Feature\Models;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Meeting Domain Model Test。
 *
 * Meeting Domainでは、
 *
 * ・Meeting → Project Relation
 * ・Project → Meetings Relation
 * ・scheduled_at / completed_atのCast
 * ・duration_minutesのCast
 * ・Project削除時のMeeting Cascade Delete
 *
 * を確認する。
 *
 * HTTP APIの動作ではなく、
 * Model / Database Relationそのものが
 * 正しく動作することを目的とする。
 */
class MeetingModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test用User。
     *
     * Meeting自身にはuser_idを持たせず、
     *
     * User
     * ↓
     * Customer
     * ↓
     * Project
     * ↓
     * Meeting
     *
     * のRelationによって所有Userを判定する。
     */
    private User $user;

    /**
     * 各Test実行前の共通準備。
     */
    protected function setUp(): void
    {
        parent::setUp();

        /**
         * Customerの所有者となる
         * Test用Userを作成する。
         */
        $this->user =
            User::factory()->create();
    }

    /**
     * Test用Customerを作成する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createCustomer(
        array $overrides = [],
    ): Customer {
        return Customer::create(
            array_merge(
                [
                    'user_id' => $this->user->id,

                    'name' => '株式会社テスト',

                    'name_kana' => 'カブシキガイシャテスト',

                    'contact_name' => '山田 太郎',

                    'contact_name_kana' => 'ヤマダ タロウ',

                    'email' => 'meeting-model@example.com',

                    'phone' => '03-1234-5678',

                    'postal_code' => '100-0001',

                    'address' => '東京都千代田区',

                    'industry' => 'IT',

                    'website' => 'https://example.com',

                    'status' => 'active',

                    'last_contact_date' => '2026-10-01',

                    'memo' => 'Meeting Model Test',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Projectを作成する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createProject(
        Customer $customer,
        array $overrides = [],
    ): Project {
        return Project::create(
            array_merge(
                [
                    'customer_id' => $customer->id,

                    'name' => 'テスト案件',

                    'type' => 'Webサイト制作',

                    'owner_name' => '山田 太郎',

                    'status' => 'in_progress',

                    'priority' => 'high',

                    'amount' => 500000,

                    'start_date' => '2026-10-01',

                    'due_date' => '2026-12-31',

                    'progress' => 50,

                    'description' => 'Meeting Model Test',

                    'notes' => 'Meeting Model Test用案件',
                ],
                $overrides,
            ),
        );
    }

    /**
     * Test用Meetingを作成する。
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createMeeting(
        Project $project,
        array $overrides = [],
    ): Meeting {
        return Meeting::create(
            array_merge(
                [
                    'project_id' => $project->id,

                    'title' => '初回ヒアリング',

                    'description' => '要件確認を行う。',

                    'status' => 'scheduled',

                    'method' => 'online',

                    'scheduled_at' => '2026-11-10 14:00:00',

                    'duration_minutes' => 60,

                    'location' => 'Google Meet',

                    'result' => null,

                    'next_action' => null,

                    'completed_at' => null,
                ],
                $overrides,
            ),
        );
    }

    /**
     * Meetingから所属Projectを取得できる。
     *
     * Meeting N : 1 Project
     */
    public function test_meeting_belongs_to_project(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
            );

        /**
         * Meeting Modelのproject Relationから
         * 所属Projectを取得できる。
         */
        $this->assertSame(
            $project->id,
            $meeting->project->id,
        );

        $this->assertSame(
            'テスト案件',
            $meeting->project->name,
        );
    }

    /**
     * Projectから紐づくMeeting一覧を取得できる。
     *
     * Project 1 : N Meeting
     */
    public function test_project_has_many_meetings(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $this->createMeeting(
            $project,
            [
                'title' => '初回ヒアリング',
            ],
        );

        $this->createMeeting(
            $project,
            [
                'title' => '見積内容確認',
            ],
        );

        /**
         * Project Modelのmeetings Relationから
         * 2件のMeetingを取得できる。
         */
        $this->assertCount(
            2,
            $project->meetings,
        );

        $this->assertSame(
            2,
            $project
                ->meetings()
                ->count(),
        );

        /**
         * Relationから取得したMeetingに
         * 登録した商談名が存在する。
         */
        $this->assertTrue(
            $project
                ->meetings
                ->contains(
                    'title',
                    '初回ヒアリング',
                ),
        );

        $this->assertTrue(
            $project
                ->meetings
                ->contains(
                    'title',
                    '見積内容確認',
                ),
        );
    }

    /**
     * scheduled_at / completed_atが
     * LaravelのDateTime ObjectへCastされ、
     * duration_minutesがintegerへCastされる。
     */
    public function test_meeting_fields_are_cast(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
                [
                    'status' => 'completed',

                    'scheduled_at' => '2026-11-10 14:00:00',

                    'duration_minutes' => 90,

                    'completed_at' => '2026-11-10 15:30:00',
                ],
            );

        /**
         * scheduled_atはdatetime Castにより
         * Carbon Objectとして取得できる。
         */
        $this->assertSame(
            '2026-11-10 14:00:00',
            $meeting
                ->scheduled_at
                ->format(
                    'Y-m-d H:i:s',
                ),
        );

        /**
         * duration_minutesは
         * integerとして取得できる。
         */
        $this->assertSame(
            90,
            $meeting->duration_minutes,
        );

        /**
         * completed_atもdatetime Castにより
         * Carbon Objectとして取得できる。
         */
        $this->assertSame(
            '2026-11-10 15:30:00',
            $meeting
                ->completed_at
                ->format(
                    'Y-m-d H:i:s',
                ),
        );
    }

    /**
     * Project削除時に、
     * Projectへ所属するMeetingも削除される。
     *
     * meetings.project_idのForeign Keyへ設定した
     * cascadeOnDelete()が正しく動作することを確認する。
     */
    public function test_deleting_project_cascades_meetings(): void
    {
        $customer =
            $this->createCustomer();

        $project =
            $this->createProject(
                $customer,
            );

        $meeting =
            $this->createMeeting(
                $project,
            );

        /**
         * Project削除前には
         * MeetingがDBへ存在している。
         */
        $this->assertDatabaseHas(
            'meetings',
            [
                'id' => $meeting->id,

                'project_id' => $project->id,
            ],
        );

        /**
         * 親Projectを削除する。
         */
        $project->delete();

        /**
         * Foreign KeyのCascade Deleteによって
         * 子Meetingも削除される。
         */
        $this->assertDatabaseMissing(
            'meetings',
            [
                'id' => $meeting->id,
            ],
        );
    }
}
