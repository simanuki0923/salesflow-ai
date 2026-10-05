<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Customer API Responseを構築するResource。
 *
 * PostgreSQL / Eloquentのsnake_caseを、
 * Next.jsで扱いやすいcamelCaseへ変換する。
 */
class CustomerResource extends JsonResource
{
    /**
     * CustomerをJSON配列へ変換する。
     *
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request,
    ): array {
        return [
            'id' => $this->id,

            'name' => $this->name,

            'nameKana' => $this->name_kana,

            'contactName' => $this->contact_name,

            'contactNameKana' => $this->contact_name_kana,

            'email' => $this->email,

            'phone' => $this->phone,

            'postalCode' => $this->postal_code,

            'address' => $this->address,

            'industry' => $this->industry,

            'website' => $this->website,

            'status' => $this->status,

            /**
             * Customer Modelでdate Castしているため、
             * CarbonからYYYY-MM-DDへ変換できる。
             */
            'lastContactDate' => $this->last_contact_date
                ?->format('Y-m-d'),

            'memo' => $this->memo,

            /**
             * Controller側でwithCount('projects')した場合のみ
             * projectCountをResponseへ含める。
             */
            'projectCount' => $this->whenCounted(
                'projects',
            ),

            'createdAt' => $this->created_at
                ?->toISOString(),

            'updatedAt' => $this->updated_at
                ?->toISOString(),
        ];
    }
}
