<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Project一覧APIで使用する検索条件を検証するRequest。
 *
 * GET /api/v1/projects
 *
 * 検索・ステータス・優先度・顧客・Paginationの
 * Query ParameterをValidationする。
 */
class IndexProjectRequest extends FormRequest
{
    /**
     * 現段階ではSanctum認証をまだ適用していないため、
     * Project一覧APIへのアクセスを許可する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Project一覧APIで利用できるQuery Parameter。
     *
     * 例：
     *
     * /api/v1/projects?search=サイト
     *
     * /api/v1/projects?status=in_progress
     *
     * /api/v1/projects?priority=high
     *
     * /api/v1/projects?customerId=1
     *
     * /api/v1/projects?perPage=10&page=2
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * 案件名または顧客名を検索する文字列。
             */
            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            /**
             * 案件ステータス。
             *
             * Next.js側のProjectStatusと
             * 同じ値だけを許可する。
             */
            'status' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'draft',
                    'proposal',
                    'negotiation',
                    'in_progress',
                    'completed',
                    'cancelled',
                ]),
            ],

            /**
             * 案件優先度。
             */
            'priority' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'high',
                    'medium',
                    'low',
                ]),
            ],

            /**
             * 特定Customerの案件だけ取得するときに使用する。
             */
            'customerId' => [
                'sometimes',
                'integer',
                'exists:customers,id',
            ],

            /**
             * 1ページあたりの表示件数。
             *
             * APIへ極端に大きい値を指定されないよう
             * 最大100件までに制限する。
             */
            'perPage' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],

            /**
             * Paginationのページ番号。
             */
            'page' => [
                'sometimes',
                'integer',
                'min:1',
            ],
        ];
    }
}
