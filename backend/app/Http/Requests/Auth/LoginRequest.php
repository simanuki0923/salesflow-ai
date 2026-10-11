<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Loginは未認証Userが利用するため、
     * Request自体では拒否しない。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Login Formから受け取る値をValidationする。
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],

            'remember' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Laravel Authenticationへ渡す認証情報だけを返す。
     *
     * rememberはLogin状態保持用なので、
     * Credentialには含めない。
     *
     * @return array<string, mixed>
     */
    public function credentials(): array
    {
        return $this->only([
            'email',
            'password',
        ]);
    }
}
