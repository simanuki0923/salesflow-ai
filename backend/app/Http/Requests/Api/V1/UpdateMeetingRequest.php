<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Meeting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Meeting更新APIのValidation。
 *
 * PUT/PATCH
 * /api/v1/meetings/{meeting}
 */
class UpdateMeetingRequest extends FormRequest
{
    /**
     * 更新対象Meetingが
     * Login User自身のDataであることを確認する。
     */
    public function authorize(): bool
    {
        $meeting =
            $this->route(
                'meeting',
            );

        if (
            ! $meeting instanceof Meeting
        ) {
            return false;
        }

        $user =
            $this->user();

        if ($user === null) {
            return false;
        }

        /**
         * Meeting
         * ↓
         * Project
         * ↓
         * Customer
         * ↓
         * User
         *
         * をたどって所有者を確認する。
         */
        $ownedByUser = $meeting
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
     * PATCHによる部分更新Validation。
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
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

            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'status' => [
                'sometimes',
                'required',

                Rule::in([
                    'scheduled',
                    'completed',
                    'cancelled',
                ]),
            ],

            'method' => [
                'sometimes',
                'required',

                Rule::in([
                    'in_person',
                    'online',
                    'phone',
                ]),
            ],

            'scheduledAt' => [
                'sometimes',
                'required',
                'date',
            ],

            'durationMinutes' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
                'max:1440',
            ],

            'location' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'result' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'nextAction' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * PATCHで送信された項目だけを
     * snake_caseへ変換する。
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
                'method',
                $data,
            )
        ) {
            $attributes['method'] =
                $data['method'];
        }

        if (
            array_key_exists(
                'scheduledAt',
                $data,
            )
        ) {
            $attributes['scheduled_at'] =
                $data['scheduledAt'];
        }

        if (
            array_key_exists(
                'durationMinutes',
                $data,
            )
        ) {
            $attributes['duration_minutes'] =
                $data['durationMinutes'];
        }

        if (
            array_key_exists(
                'location',
                $data,
            )
        ) {
            $attributes['location'] =
                $data['location'];
        }

        if (
            array_key_exists(
                'result',
                $data,
            )
        ) {
            $attributes['result'] =
                $data['result'];
        }

        if (
            array_key_exists(
                'nextAction',
                $data,
            )
        ) {
            $attributes['next_action'] =
                $data['nextAction'];
        }

        return $attributes;
    }
}
