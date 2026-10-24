<?php

namespace Tests\Feature\Seeders;

use App\Models\Customer;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\DemoPortfolioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * 公開Portfolio用Demo SeederのFeature Test。
 */
class DemoPortfolioSeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Demo UserからCustomer / Project / Task / Meetingまで
     * 一連のDemo Dataを生成できる。
     */
    public function test_can_seed_demo_portfolio_data(): void
    {
        $this->seed(
            DemoPortfolioSeeder::class,
        );

        $user = User::query()
            ->where(
                'email',
                'demo@salesflow-ai.local',
            )
            ->firstOrFail();

        $this->assertSame(
            3,
            $user->customers()->count(),
        );

        $this->assertSame(
            4,
            Project::query()
                ->whereHas(
                    'customer',
                    fn ($query) => $query->where(
                        'user_id',
                        $user->id,
                    ),
                )
                ->count(),
        );

        $this->assertSame(
            7,
            Task::query()
                ->whereHas(
                    'project.customer',
                    fn ($query) => $query->where(
                        'user_id',
                        $user->id,
                    ),
                )
                ->count(),
        );

        $this->assertSame(
            7,
            Meeting::query()
                ->whereHas(
                    'project.customer',
                    fn ($query) => $query->where(
                        'user_id',
                        $user->id,
                    ),
                )
                ->count(),
        );

        $this->assertTrue(
            Customer::query()
                ->where(
                    'user_id',
                    $user->id,
                )
                ->where(
                    'status',
                    'active',
                )
                ->exists(),
        );

        $this->assertTrue(
            Meeting::query()
                ->where(
                    'status',
                    'scheduled',
                )
                ->where(
                    'scheduled_at',
                    '>',
                    now(),
                )
                ->exists(),
        );
    }

    /**
     * Seederを複数回実行しても
     * 同じDemo Dataが重複しない。
     */
    public function test_demo_portfolio_seeder_is_idempotent(): void
    {
        $this->seed(
            DemoPortfolioSeeder::class,
        );

        $this->seed(
            DemoPortfolioSeeder::class,
        );

        $user = User::query()
            ->where(
                'email',
                'demo@salesflow-ai.local',
            )
            ->firstOrFail();

        $this->assertSame(
            1,
            User::query()
                ->where(
                    'email',
                    'demo@salesflow-ai.local',
                )
                ->count(),
        );

        $this->assertSame(
            3,
            Customer::query()
                ->where(
                    'user_id',
                    $user->id,
                )
                ->count(),
        );

        $this->assertSame(
            4,
            Project::query()
                ->whereHas(
                    'customer',
                    fn ($query) => $query->where(
                        'user_id',
                        $user->id,
                    ),
                )
                ->count(),
        );

        $this->assertSame(
            7,
            Task::query()
                ->whereHas(
                    'project.customer',
                    fn ($query) => $query->where(
                        'user_id',
                        $user->id,
                    ),
                )
                ->count(),
        );

        $this->assertSame(
            7,
            Meeting::query()
                ->whereHas(
                    'project.customer',
                    fn ($query) => $query->where(
                        'user_id',
                        $user->id,
                    ),
                )
                ->count(),
        );
    }
}
