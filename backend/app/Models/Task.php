<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Task Model。
 *
 * PostgreSQLのtasksテーブルと対応する
 * Eloquent Model。
 *
 * Task自身にはuser_idを持たせず、
 *
 * Task
 *   ↓
 * Project
 *   ↓
 * Customer
 *   ↓
 * User
 *
 * のRelationによって所有Userを判定する。
 */
class Task extends Model
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
        'priority',
        'due_date',
        'completed_at',
    ];

    /**
     * DBから取得した値を
     * PHP側で適切な型へ変換する。
     *
     * due_date:
     *   Carbon Date
     *
     * completed_at:
     *   Carbon DateTime
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * このTaskが所属するProject。
     *
     * Task N : 1 Project
     *
     * tasks.project_id
     *      ↓
     * projects.id
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
