<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Customer;
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
    /**
     * 更新対象Customerが
     * Login User自身のCustomerであることを確認する。
     *
     * FormRequestのauthorize()は
     * Controllerのupdate()より先に実行される。
     *
     * そのためOwnership確認もここで行い、
     * 他UserのCustomerに対してValidation結果などを
     * 返してしまわないようにする。
     */
    public function authorize(): bool
    {
        /**
         * Route Model Bindingによって、
         *
         * /customers/{customer}
         *
         * の{customer}はCustomer Modelへ解決される。
         */
        $customer =
            $this->route('customer');

        if (
            ! $customer instanceof Customer
        ) {
            return false;
        }

        $user = $this->user();

        if ($user === null) {
            return false;
        }

        /**
         * Customerの所有Userと
         * Login Userが一致するか確認する。
         *
         * 他UserのCustomerの場合は403ではなく404を返す。
         *
         * 404にすることで、
         * そのCustomer IDが実在すること自体を
         * 他Userへ公開しない。
         */
        if (
            (int) $customer->user_id !==
            (int) $user->id
        ) {
            abort(404);
        }

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
