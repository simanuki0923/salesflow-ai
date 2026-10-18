<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Meeting API Responseを作成するResource。
 *
 * PostgreSQL / Eloquentのsnake_caseを
 * Next.js向けcamelCaseへ変換する。
 */
class MeetingResource extends JsonResource
{
    /**
     * Meeting ModelをAPI JSONへ変換する。
     *
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request,
    ): array {
        return [
            'id' => $this->id,

            'projectId' => $this->project_id,

            /**
             * ControllerでRelationを
             * Loadした場合にProject名を返す。
             */
            'projectName' => $this->whenLoaded(
                'project',
                fn () => $this->project
                    ?->name,
            ),

            /**
             * Project経由でCustomer名を返す。
             */
            'customerName' => $this->whenLoaded(
                'project',
                function () {
                    if (
                        ! $this->project ||
                        ! $this->project
                            ->relationLoaded(
                                'customer',
                            )
                    ) {
                        return null;
                    }

                    return $this
                        ->project
                        ->customer
                        ?->name;
                },
            ),

            'title' => $this->title,

            'description' => $this->description,

            'status' => $this->status,

            'method' => $this->method,

            /**
             * datetime Castされた値を
             * ISO 8601形式で返す。
             */
            'scheduledAt' => $this->scheduled_at
                ?->toISOString(),

            'durationMinutes' => $this->duration_minutes,

            'location' => $this->location,

            'result' => $this->result,

            'nextAction' => $this->next_action,

            'completedAt' => $this->completed_at
                ?->toISOString(),

            'createdAt' => $this->created_at
                ?->toISOString(),

            'updatedAt' => $this->updated_at
                ?->toISOString(),
        ];
    }
}
