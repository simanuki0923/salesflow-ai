<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Project更新APIのValidation。
 *
 * PUT/PATCH
 * /api/v1/projects/{project}
 *
 * PATCHによる部分更新に対応する。
 */
class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 更新時Validation。
     *
     * sometimesを使用することで、
     * Requestへ送られた項目だけ検証する。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'customerId' => [
                'sometimes',
                'required',
                'integer',
                'exists:customers,id',
            ],

            'type' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'ownerName' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'status' => [
                'sometimes',
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

            'priority' => [
                'sometimes',
                'required',
                Rule::in([
                    'high',
                    'medium',
                    'low',
                ]),
            ],

            'amount' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],

            /**
             * 更新時はstartDateだけ、
             * またはdueDateだけ送られる可能性がある。
             *
             * そのため日付の前後関係は
             * withValidator()で既存DB値も含めて確認する。
             */
            'startDate' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
            ],

            'dueDate' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
            ],

            'progress' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
                'max:100',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * 基本Validation終了後に、
     * 開始日と期限の前後関係を検証する。
     *
     * PATCHでは片方の日付だけが送信される場合があるため、
     * Requestに存在しない側の日付は
     * DB上の既存Projectから取得する。
     */
    public function withValidator(
        Validator $validator,
    ): void {
        $validator->after(
            function (
                Validator $validator,
            ): void {
                /**
                 * Route Model Bindingによって、
                 *
                 * /projects/{project}
                 *
                 * の{project}はProject Modelへ
                 * 解決されている。
                 */
                $project =
                    $this->route('project');

                if (
                    ! $project instanceof Project
                ) {
                    return;
                }

                /**
                 * startDateがRequestにあれば新しい値、
                 * なければDBの現在値を使用する。
                 */
                $startDate =
                    $this->input(
                        'startDate',
                        $project
                            ->start_date
                            ?->format('Y-m-d'),
                    );

                /**
                 * dueDateも同じ考え方。
                 */
                $dueDate =
                    $this->input(
                        'dueDate',
                        $project
                            ->due_date
                            ?->format('Y-m-d'),
                    );

                /**
                 * YYYY-MM-DD形式なら
                 * 文字列比較でも時系列順を比較できる。
                 */
                if (
                    is_string($startDate) &&
                    is_string($dueDate) &&
                    $dueDate < $startDate
                ) {
                    $validator
                        ->errors()
                        ->add(
                            'dueDate',
                            '期限は開始日以降の日付を指定してください。',
                        );
                }
            },
        );
    }

    /**
     * Requestへ存在する項目だけ、
     * API camelCaseからDatabase snake_caseへ変換する。
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data = $this->validated();

        $fieldMap = [
            'name' => 'name',

            'customerId' => 'customer_id',

            'type' => 'type',

            'ownerName' => 'owner_name',

            'status' => 'status',

            'priority' => 'priority',

            'amount' => 'amount',

            'startDate' => 'start_date',

            'dueDate' => 'due_date',

            'progress' => 'progress',

            'description' => 'description',

            'notes' => 'notes',
        ];

        $attributes = [];

        foreach (
            $fieldMap as $apiField => $databaseField
        ) {
            /**
             * null自体も有効な更新値なので、
             * isset()ではなくarray_key_exists()を使う。
             */
            if (
                array_key_exists(
                    $apiField,
                    $data,
                )
            ) {
                $attributes[
                    $databaseField
                ] = $data[$apiField];
            }
        }

        return $attributes;
    }
}
