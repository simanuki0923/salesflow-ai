<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Meeting一覧APIのQuery Parameter Validation。
 *
 * GET /api/v1/meetings
 */
class IndexMeetingRequest extends FormRequest
{
    /**
     * Meeting API自体は
     * auth:sanctumで保護する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Meeting一覧の検索・絞り込み条件。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * Meeting名・詳細・Project名・Customer名などの
             * Keyword検索。
             */
            'search' => [
                'nullable',
                'string',
                'max:255',
            ],

            /**
             * Meeting Status。
             */
            'status' => [
                'nullable',

                Rule::in([
                    'scheduled',
                    'completed',
                    'cancelled',
                ]),
            ],

            /**
             * Meeting Method。
             */
            'method' => [
                'nullable',

                Rule::in([
                    'in_person',
                    'online',
                    'phone',
                ]),
            ],

            /**
             * 所属ProjectによるFilter。
             *
             * Query本体をLogin User所有Dataへ
             * Scopeするため、
             * ここではinteger Validationだけ行う。
             */
            'projectId' => [
                'nullable',
                'integer',
                'min:1',
            ],

            /**
             * 1ページの表示件数。
             */
            'perPage' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }
}
