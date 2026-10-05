<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Project新規登録APIのValidation。
 *
 * POST /api/v1/projects
 *
 * Next.jsから送信されるcamelCase形式のJSONを検証し、
 * PostgreSQLで使用するsnake_case形式へ変換する。
 */
class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Project新規登録時のValidation。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * 案件名。
             */
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            /**
             * 案件を所有するCustomer。
             *
             * customersテーブルに実在するIDだけを許可する。
             */
            'customerId' => [
                'required',
                'integer',
                'exists:customers,id',
            ],

            /**
             * 案件種別。
             */
            'type' => [
                'nullable',
                'string',
                'max:100',
            ],

            /**
             * 社内担当者名。
             */
            'ownerName' => [
                'required',
                'string',
                'max:255',
            ],

            /**
             * 案件ステータス。
             */
            'status' => [
                'required',
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
                'required',
                Rule::in([
                    'high',
                    'medium',
                    'low',
                ]),
            ],

            /**
             * 案件金額。
             *
             * 0円以上の整数とする。
             */
            'amount' => [
                'required',
                'integer',
                'min:0',
            ],

            /**
             * 案件開始日。
             *
             * Frontendのinput type="date"と揃えて
             * YYYY-MM-DD形式に限定する。
             */
            'startDate' => [
                'required',
                'date_format:Y-m-d',
            ],

            /**
             * 案件期限。
             *
             * 開始日より前の日付は許可しない。
             */
            'dueDate' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:startDate',
            ],

            /**
             * 案件進捗率。
             *
             * 0〜100。
             */
            'progress' => [
                'required',
                'integer',
                'min:0',
                'max:100',
            ],

            /**
             * 案件概要。
             */
            'description' => [
                'nullable',
                'string',
            ],

            /**
             * 補足メモ。
             */
            'notes' => [
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * API用camelCaseから、
     * Eloquent / PostgreSQL用snake_caseへ変換する。
     *
     * Next.js:
     *
     * customerId
     * ownerName
     * startDate
     * dueDate
     *
     * ↓
     *
     * Laravel / PostgreSQL:
     *
     * customer_id
     * owner_name
     * start_date
     * due_date
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data = $this->validated();

        return [
            'name' => $data['name'],

            'customer_id' => $data['customerId'],

            'type' => $data['type'] ?? null,

            'owner_name' => $data['ownerName'],

            'status' => $data['status'],

            'priority' => $data['priority'],

            'amount' => $data['amount'],

            'start_date' => $data['startDate'],

            'due_date' => $data['dueDate'],

            'progress' => $data['progress'],

            'description' => $data['description'] ?? null,

            'notes' => $data['notes'] ?? null,
        ];
    }
}
