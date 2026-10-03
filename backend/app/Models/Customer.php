<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Customer Model。
 *
 * customersテーブルと対応する
 * Eloquent Model。
 *
 * Controllerから直接SQLを書くのではなく、
 * このModelを通してCustomer情報を操作する。
 */
class Customer extends Model
{
    use HasFactory;

    /**
     * create() / update()による
     * 一括代入を許可するカラム。
     *
     * ここへ記載されていない属性は
     * Mass Assignmentの対象にならない。
     *
     * id / created_at / updated_at は
     * Laravel側で管理するため含めない。
     */
    protected $fillable = [
        'user_id',
        'name',
        'name_kana',
        'contact_name',
        'contact_name_kana',
        'email',
        'phone',
        'postal_code',
        'address',
        'industry',
        'website',
        'status',
        'last_contact_date',
        'memo',
    ];

    /**
     * DBから取得した属性を
     * PHP側でどの型として扱うかを定義する。
     *
     * last_contact_dateをdateへCastすることで、
     * Carbonインスタンスとして利用できる。
     *
     * Laravel API Resource作成時には、
     *
     * $customer->last_contact_date->format('Y-m-d')
     *
     * のように扱える。
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_contact_date' => 'date',
        ];
    }

    /**
     * このCustomerを所有するUser。
     *
     * Customer N : 1 User
     *
     * 現在user_idはnullableなので、
     * Userが設定されていないCustomerも存在できる。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
