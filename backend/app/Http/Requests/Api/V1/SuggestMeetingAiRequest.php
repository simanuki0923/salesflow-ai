<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Meeting AI提案API Request。
 *
 * Meeting Formへ入力された商談内容を
 * OpenAIへ渡す前にValidationする。
 *
 * このAPIではMeeting自体を保存・更新しないため、
 * Meeting IDやProject IDは必須としない。
 *
 * Browser
 *   ↓
 * SuggestMeetingAiRequest
 *   ↓
 * MeetingAiSuggestionController
 *   ↓
 * OpenAiMeetingSuggestionService
 *
 * の境界で入力値を保証する。
 */
class SuggestMeetingAiRequest extends FormRequest
{
    /**
     * auth:sanctum配下で使用するため、
     * Login Userのみ利用可能。
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * AIへ渡す入力値。
     *
     * descriptionはAI提案の中心となる情報なので必須。
     *
     * result / nextActionは、
     * すでにUserが入力している場合に
     * AIがその内容も踏まえて改善提案できるよう受け取る。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'required',
                'string',
                'max:10000',
            ],

            'result' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'nextAction' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    /**
     * Frontendへ返すValidation Message。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => '商談名を入力してください。',

            'description.required' => 'AI提案を作成するには商談内容を入力してください。',

            'description.max' => '商談内容は10000文字以内で入力してください。',

            'result.max' => '商談結果は5000文字以内で入力してください。',

            'nextAction.max' => '次回対応は5000文字以内で入力してください。',
        ];
    }
}
