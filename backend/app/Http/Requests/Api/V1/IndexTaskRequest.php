<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Task一覧APIで使用する検索条件を検証するRequest。
 *
 * GET /api/v1/tasks
 *
 * 検索・ステータス・優先度・案件・Paginationの
 * Query ParameterをValidationする。
 */
class IndexTaskRequest extends FormRequest
{
    /**
     * Task API自体はroutes/api.phpの
     * auth:sanctum Middlewareで保護する。
     *
     * このRequestでは追加の認可判定を行わないため
     * trueを返す。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Task一覧APIで利用できるQuery Parameter。
     *
     * 例：
     *
     * /api/v1/tasks?search=資料
     *
     * /api/v1/tasks?status=in_progress
     *
     * /api/v1/tasks?priority=high
     *
     * /api/v1/tasks?projectId=1
     *
     * /api/v1/tasks?perPage=10&page=2
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * Task名などを検索する文字列。
             */
            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            /**
             * Task Status。
             *
             * tasksテーブルで使用する
             * 4種類だけを許可する。
             */
            'status' => [
                'sometimes',
                'nullable',

                Rule::in([
                    'todo',
                    'in_progress',
                    'completed',
                    'cancelled',
                ]),
            ],

            /**
             * Task Priority。
             *
             * Project Priorityと同じ値を使用する。
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
             * 特定ProjectのTaskだけ取得するときに使用する。
             *
             * Controller側でもLogin User所有Taskだけに
             * Scopeするため、他UserのTaskは返さない。
             */
            'projectId' => [
                'sometimes',
                'integer',
                'exists:projects,id',
            ],

            /**
             * 1ページあたりの表示件数。
             *
             * APIへ極端に大きな値を指定されないよう
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
