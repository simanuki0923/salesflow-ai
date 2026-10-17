<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Task API Responseを作成するResource。
 *
 * PostgreSQL / Eloquentのsnake_caseを
 * Next.js向けcamelCaseへ変換する。
 */
class TaskResource extends JsonResource
{
    /**
     * Task ModelをAPI JSONへ変換する。
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
             * Controller側でproject Relationを
             * load / withした場合だけ案件名を返す。
             */
            'projectName' => $this->whenLoaded(
                'project',
                fn () => $this->project?->name,
            ),

            /**
             * project.customerまでEager Loadした場合に
             * Customer名を返す。
             *
             * Task一覧画面で、
             *
             * Task
             * Project
             * Customer
             *
             * の関係を確認できるようにする。
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

            'priority' => $this->priority,

            /**
             * date Castされたdue_dateを
             * Frontendのinput type="date"でも扱える
             * YYYY-MM-DD形式へ変換する。
             */
            'dueDate' => $this->due_date
                ?->format('Y-m-d'),

            /**
             * completed_atはdatetime Castなので、
             * ISO 8601形式で返す。
             */
            'completedAt' => $this->completed_at
                ?->toISOString(),

            'createdAt' => $this->created_at
                ?->toISOString(),

            'updatedAt' => $this->updated_at
                ?->toISOString(),
        ];
    }
}
