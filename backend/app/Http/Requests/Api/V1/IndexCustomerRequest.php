<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Customer一覧APIの検索条件を検証するRequest。
 *
 * GET /api/v1/customers
 *
 * で利用する。
 *
 * ControllerへValidation処理を書かず、
 * 検索条件の責務をFormRequestへ分離する。
 */
class IndexCustomerRequest extends FormRequest
{
    /**
     * 現段階ではSanctum認証前なので
     * API利用を許可する。
     *
     * 認証導入後はPolicyなどと組み合わせて
     * アクセス制御する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Customer一覧で利用可能なQuery Parameter。
     *
     * 例：
     *
     * /api/v1/customers?search=ABC
     * /api/v1/customers?status=active
     * /api/v1/customers?perPage=10&page=2
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'perPage' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],

            'page' => [
                'sometimes',
                'integer',
                'min:1',
            ],
        ];
    }
}
