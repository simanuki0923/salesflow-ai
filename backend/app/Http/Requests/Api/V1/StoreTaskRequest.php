<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Task新規登録APIのValidation。
 *
 * POST /api/v1/tasks
 *
 * Next.jsから送信されるcamelCase形式のJSONを検証し、
 * PostgreSQL / Eloquentで使用するsnake_case形式へ変換する。
 */
class StoreTaskRequest extends FormRequest
{
    /**
     * Task API自体はauth:sanctumで保護する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Task新規登録時のValidation。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * Taskが所属するProject。
             *
             * Projectが存在するだけではなく、
             * Login User自身が所有するProjectだけを許可する。
             *
             * User
             * ↓
             * Customer
             * ↓
             * Project
             *
             * の関係を使ってValidationする。
             */
            'projectId' => [
                'required',
                'integer',

                Rule::exists(
                    'projects',
                    'id',
                )->where(
                    function ($query): void {
                        $query->whereIn(
                            'customer_id',
                            function ($customerQuery): void {
                                $customerQuery
                                    ->select('id')
                                    ->from('customers')
                                    ->where(
                                        'user_id',
                                        $this->user()->id,
                                    );
                            },
                        );
                    },
                ),
            ],

            /**
             * Task名。
             */
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            /**
             * Task詳細。
             */
            'description' => [
                'nullable',
                'string',
            ],

            /**
             * Task Status。
             */
            'status' => [
                'required',

                Rule::in([
                    'todo',
                    'in_progress',
                    'completed',
                    'cancelled',
                ]),
            ],

            /**
             * Task Priority。
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
             * Task期限。
             *
             * 期限未設定も許可する。
             */
            'dueDate' => [
                'nullable',
                'date_format:Y-m-d',
            ],
        ];
    }

    /**
     * Frontend APIのcamelCaseから、
     * Eloquent / PostgreSQLのsnake_caseへ変換する。
     *
     * Next.js:
     *
     * projectId
     * dueDate
     *
     * ↓
     *
     * Laravel / PostgreSQL:
     *
     * project_id
     * due_date
     *
     * completed_atについては、
     * Status変更に応じてController側で管理する。
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data = $this->validated();

        return [
            'project_id' => $data['projectId'],

            'title' => $data['title'],

            'description' => $data['description']
                ?? null,

            'status' => $data['status'],

            'priority' => $data['priority'],

            'due_date' => $data['dueDate']
                ?? null,
        ];
    }
}
