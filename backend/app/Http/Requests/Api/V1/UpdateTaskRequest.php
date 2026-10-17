<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Task更新APIのValidation。
 *
 * PUT/PATCH
 * /api/v1/tasks/{task}
 *
 * PATCHによる部分更新に対応する。
 */
class UpdateTaskRequest extends FormRequest
{
    /**
     * 更新対象Taskが
     * Login User自身のTaskであることを確認する。
     *
     * FormRequestのValidationはControllerより先に
     * 実行されるため、
     * Ownership確認もValidation前に行う。
     *
     * Task
     * ↓
     * Project
     * ↓
     * Customer
     * ↓
     * User
     *
     * とRelationをたどって所有者を判定する。
     *
     * 他UserのTaskの場合は404を返し、
     * Taskの存在情報を公開しない。
     */
    public function authorize(): bool
    {
        $task =
            $this->route('task');

        if (
            ! $task instanceof Task
        ) {
            return false;
        }

        $user =
            $this->user();

        if ($user === null) {
            return false;
        }

        /**
         * Taskが所属するProjectのCustomerが
         * Login User所有か確認する。
         */
        $ownedByUser = $task
            ->project()
            ->whereHas(
                'customer',
                function ($query) use ($user): void {
                    $query->where(
                        'user_id',
                        $user->id,
                    );
                },
            )
            ->exists();

        if (! $ownedByUser) {
            abort(404);
        }

        return true;
    }

    /**
     * Task更新時Validation。
     *
     * sometimesを使用することで、
     * Requestに送信された項目だけを検証する。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * 所属Projectを変更する場合も、
             * Login User自身が所有するProjectだけを許可する。
             */
            'projectId' => [
                'sometimes',
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
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            /**
             * Task詳細。
             *
             * nullを送信することで
             * Descriptionを削除できる。
             */
            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            /**
             * Task Status。
             */
            'status' => [
                'sometimes',
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
                'sometimes',
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
             * nullを指定することで
             * 期限未設定へ戻すこともできる。
             */
            'dueDate' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
            ],
        ];
    }

    /**
     * PATCHで送信された項目だけを、
     * Eloquent用snake_caseへ変換する。
     *
     * nullを正しく更新できるよう、
     * isset()ではなくarray_key_exists()を使用する。
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data =
            $this->validated();

        $attributes = [];

        if (
            array_key_exists(
                'projectId',
                $data,
            )
        ) {
            $attributes['project_id'] =
                $data['projectId'];
        }

        if (
            array_key_exists(
                'title',
                $data,
            )
        ) {
            $attributes['title'] =
                $data['title'];
        }

        if (
            array_key_exists(
                'description',
                $data,
            )
        ) {
            $attributes['description'] =
                $data['description'];
        }

        if (
            array_key_exists(
                'status',
                $data,
            )
        ) {
            $attributes['status'] =
                $data['status'];
        }

        if (
            array_key_exists(
                'priority',
                $data,
            )
        ) {
            $attributes['priority'] =
                $data['priority'];
        }

        if (
            array_key_exists(
                'dueDate',
                $data,
            )
        ) {
            $attributes['due_date'] =
                $data['dueDate'];
        }

        return $attributes;
    }
}
