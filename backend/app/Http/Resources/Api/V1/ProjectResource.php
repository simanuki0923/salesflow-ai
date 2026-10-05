<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Project API Responseを作成するResource。
 *
 * PostgreSQL / Eloquentのsnake_caseを
 * Next.js向けcamelCaseへ変換する。
 */
class ProjectResource extends JsonResource
{
    /**
     * Project ModelをAPI JSONへ変換する。
     *
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request,
    ): array {
        return [
            'id' => $this->id,

            'name' => $this->name,

            'customerId' => $this->customer_id,

            /**
             * Controller側でcustomer Relationを
             * load / withした場合だけ顧客名を返す。
             */
            'customerName' => $this->whenLoaded(
                'customer',
                fn () => $this->customer?->name,
            ),

            'type' => $this->type,

            'ownerName' => $this->owner_name,

            'status' => $this->status,

            'priority' => $this->priority,

            /**
             * Project Model側でintegerへCast済み。
             */
            'amount' => $this->amount,

            /**
             * date CastされたCarbonを、
             * Frontendのinput type="date"でも扱える
             * YYYY-MM-DD形式へ統一する。
             */
            'startDate' => $this->start_date
                ?->format('Y-m-d'),

            'dueDate' => $this->due_date
                ?->format('Y-m-d'),

            'progress' => $this->progress,

            'description' => $this->description,

            'notes' => $this->notes,

            'createdAt' => $this->created_at
                ?->toISOString(),

            'updatedAt' => $this->updated_at
                ?->toISOString(),
        ];
    }
}
