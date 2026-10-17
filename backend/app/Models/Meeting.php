<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Meeting Model。
 *
 * PostgreSQLのmeetingsテーブルと対応する
 * Eloquent Model。
 *
 * Meeting自身にはuser_idを持たせず、
 *
 * Meeting
 *   ↓
 * Project
 *   ↓
 * Customer
 *   ↓
 * User
 *
 * のRelationによって所有Userを判定する。
 */
class Meeting extends Model
{
    use HasFactory;

    /**
     * create() / update()による
     * 一括代入を許可するカラム。
     */
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'method',
        'scheduled_at',
        'duration_minutes',
        'location',
        'result',
        'next_action',
        'completed_at',
    ];

    /**
     * DBから取得した値を
     * PHP側で適切な型へ変換する。
     *
     * scheduled_at:
     *   Carbon DateTime
     *
     * duration_minutes:
     *   integer
     *
     * completed_at:
     *   Carbon DateTime
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * このMeetingが所属するProject。
     *
     * Meeting N : 1 Project
     *
     * meetings.project_id
     *      ↓
     * projects.id
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(
            Project::class,
        );
    }
}
