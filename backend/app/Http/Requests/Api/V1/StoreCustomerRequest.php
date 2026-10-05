<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Customer新規登録APIのValidation。
 *
 * POST /api/v1/customers
 *
 * Next.jsから送られてくるcamelCaseのJSONを検証し、
 * PostgreSQL用snake_caseへ変換する役割も持つ。
 */
class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 新規Customer登録時のValidation。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'nameKana' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contactName' => [
                'required',
                'string',
                'max:255',
            ],

            'contactNameKana' => [
                'nullable',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'postalCode' => [
                'nullable',
                'string',
                'max:20',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'industry' => [
                'nullable',
                'string',
                'max:100',
            ],

            'website' => [
                'nullable',
                'url',
                'max:2048',
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'lastContactDate' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'memo' => [
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * APIで受け取ったcamelCaseを
     * Eloquent / PostgreSQL用snake_caseへ変換する。
     *
     * Next.js:
     *
     * contactName
     * postalCode
     * lastContactDate
     *
     * ↓
     *
     * Laravel / PostgreSQL:
     *
     * contact_name
     * postal_code
     * last_contact_date
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data = $this->validated();

        return [
            'name' => $data['name'],

            'name_kana' => $data['nameKana'] ?? null,

            'contact_name' => $data['contactName'],

            'contact_name_kana' => $data['contactNameKana'] ?? null,

            'email' => $data['email'],

            'phone' => $data['phone'] ?? null,

            'postal_code' => $data['postalCode'] ?? null,

            'address' => $data['address'] ?? null,

            'industry' => $data['industry'] ?? null,

            'website' => $data['website'] ?? null,

            'status' => $data['status'],

            'last_contact_date' => $data['lastContactDate'] ?? null,

            'memo' => $data['memo'] ?? null,
        ];
    }
}
