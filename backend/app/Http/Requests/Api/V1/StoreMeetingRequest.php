<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Meeting新規登録APIのValidation。
 *
 * POST /api/v1/meetings
 *
 * Next.jsから送信されるcamelCase形式を検証し、
 * Eloquent用snake_caseへ変換する。
 */
class StoreMeetingRequest extends FormRequest
{
    /**
     * Meeting API自体は
     * auth:sanctumで保護する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Meeting新規登録Validation。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            /**
             * Meetingが所属するProject。
             *
             * Login User自身が所有するProjectだけを
             * 登録先として許可する。
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
             * 商談名。
             */
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            /**
             * 商談内容。
             */
            'description' => [
                'nullable',
                'string',
            ],

            /**
             * Meeting Status。
             */
            'status' => [
                'required',

                Rule::in([
                    'scheduled',
                    'completed',
                    'cancelled',
                ]),
            ],

            /**
             * 商談方法。
             */
            'method' => [
                'required',

                Rule::in([
                    'in_person',
                    'online',
                    'phone',
                ]),
            ],

            /**
             * 商談予定日時。
             *
             * Next.jsのdatetime-localから送信される
             * 日時も扱えるようdate Validationを使用する。
             */
            'scheduledAt' => [
                'required',
                'date',
            ],

            /**
             * 商談時間。
             *
             * 分単位。
             */
            'durationMinutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:1440',
            ],

            /**
             * 訪問場所・Meeting URLなど。
             */
            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            /**
             * 商談結果。
             */
            'result' => [
                'nullable',
                'string',
            ],

            /**
             * 次回対応内容。
             */
            'nextAction' => [
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * FrontendのcamelCaseから、
     * Eloquentのsnake_caseへ変換する。
     *
     * completed_atはStatusと同期して
     * Controller側で管理する。
     *
     * @return array<string, mixed>
     */
    public function modelAttributes(): array
    {
        $data =
            $this->validated();

        return [
            'project_id' => $data['projectId'],

            'title' => $data['title'],

            'description' => $data['description']
                ?? null,

            'status' => $data['status'],

            'method' => $data['method'],

            'scheduled_at' => $data['scheduledAt'],

            'duration_minutes' => $data['durationMinutes']
                ?? null,

            'location' => $data['location']
                ?? null,

            'result' => $data['result']
                ?? null,

            'next_action' => $data['nextAction']
                ?? null,
        ];
    }
}
