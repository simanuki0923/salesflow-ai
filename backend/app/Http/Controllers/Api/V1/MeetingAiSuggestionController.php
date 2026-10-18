<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SuggestMeetingAiRequest;
use App\Services\Ai\OpenAiMeetingSuggestionService;
use Illuminate\Http\JsonResponse;
use Throwable;

/**
 * Meeting AI営業支援API。
 *
 * Meeting CRUDとは別Controllerに分離し、
 * AI提案生成だけを担当する。
 *
 * このAPIではMeetingを保存・更新しない。
 *
 * User
 *   ↓
 * Meeting Form
 *   ↓
 * POST /api/v1/meeting-ai/suggest
 *   ↓
 * OpenAI
 *   ↓
 * result / nextAction Proposal
 *   ↓
 * User確認
 *   ↓
 * 通常のMeeting保存API
 *
 * というHuman-in-the-loop構成にする。
 */
class MeetingAiSuggestionController extends Controller
{
    /**
     * AIによる商談結果・次回対応案を生成する。
     */
    public function __invoke(
        SuggestMeetingAiRequest $request,
        OpenAiMeetingSuggestionService $service,
    ): JsonResponse {
        try {
            $suggestion =
                $service->suggest(
                    $request->validated(),
                );
        } catch (Throwable $exception) {
            /**
             * OpenAI側のError内容を
             * Browserへそのまま公開しない。
             *
             * Laravel LogにはExceptionを記録し、
             * ClientへはApplication側のMessageを返す。
             */
            report($exception);

            return response()->json(
                [
                    'message' => 'AI提案の生成に失敗しました。しばらくしてから再度お試しください。',
                ],
                502,
            );
        }

        return response()->json([
            'data' => $suggestion,
        ]);
    }
}
