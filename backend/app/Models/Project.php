<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Project Model。
 *
 * PostgreSQLのprojectsテーブルと対応する
 * Eloquent Model。
 */
class Project extends Model
{
    use HasFactory;

    /**
     * create() / update()による
     * 一括代入を許可するカラム。
     *
     * id / created_at / updated_atは
     * Laravel側で管理するため含めない。
     */
    protected $fillable = [
        'customer_id',
        'name',
        'type',
        'owner_name',
        'status',
        'priority',
        'amount',
        'start_date',
        'due_date',
        'progress',
        'description',
        'notes',
    ];

    /**
     * DBから取得した値を、
     * PHP側で適切な型として扱う。
     *
     * amount:
     *   integer
     *
     * progress:
     *   integer
     *
     * start_date / due_date:
     *   Carbonの日付オブジェクト
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'progress' => 'integer',
            'start_date' => 'date',
            'due_date' => 'date',
        ];
    }

    /**
     * このProjectが所属するCustomer。
     *
     * Project N : 1 Customer
     *
     * projects.customer_id
     *      ↓
     * customers.id
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
