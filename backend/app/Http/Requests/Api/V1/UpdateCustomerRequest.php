<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Customer更新APIのValidation。
 *
 * PUT /api/v1/customers/{customer}
 * PATCH /api/v1/customers/{customer}
 *
 * PATCHに対応するため、
 * 各項目へsometimesを指定している。
 */
class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 更新時Validation。
     *
     * sometimes:
     *   Requestにその項目が存在するときだけ検証する。
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

            'nameKana' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'contactName' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'contactNameKana' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
            ],

            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'postalCode' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
            ],

            'address' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'industry' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'website' => [
                'sometimes',
                'nullable',
                'url',
                'max:2048',
            ],

            'status' => [
                'sometimes',
                'required',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'lastContactDate' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
            ],

            'memo' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * Requestに含まれている項目だけ、
     * camelCaseからsnake_caseへ変換する。
     *
     * PATCHで1項目だけ送信された場合に、
     * 他項目をNULLで上書きしないようにすることが重要。
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data = $this->validated();

        /**
         * API Field
         *
         * ↓
         *
         * Database Field
         */
        $fieldMap = [
            'name' => 'name',

            'nameKana' => 'name_kana',

            'contactName' => 'contact_name',

            'contactNameKana' => 'contact_name_kana',

            'email' => 'email',

            'phone' => 'phone',

            'postalCode' => 'postal_code',

            'address' => 'address',

            'industry' => 'industry',

            'website' => 'website',

            'status' => 'status',

            'lastContactDate' => 'last_contact_date',

            'memo' => 'memo',
        ];

        $attributes = [];

        foreach (
            $fieldMap as $apiField => $databaseField
        ) {
            /**
             * array_key_existsを使う理由：
             *
             * 値がnullの場合でも、
             * Requestにその項目が存在していることを
             * 正しく判定するため。
             */
            if (
                array_key_exists(
                    $apiField,
                    $data,
                )
            ) {
                $attributes[$databaseField] =
                    $data[$apiField];
            }
        }

        return $attributes;
    }
}
