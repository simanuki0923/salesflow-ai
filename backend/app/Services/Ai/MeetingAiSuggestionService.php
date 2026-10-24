<?php

namespace App\Services\Ai;

use RuntimeException;

/**
 * Meeting AI提案のApplication Service。
 *
 * Controller
 *   ↓
 * MeetingAiSuggestionService
 *   ↓
 * AI_PROVIDER
 *   ├─ demo
 *   │    ↓
 *   │  DemoMeetingSuggestionService
 *   │
 *   └─ openai
 *        ↓
 *      OpenAiMeetingSuggestionService
 *
 * Provider選択をControllerから分離することで、
 * 外部AI Serviceを変更しても
 * HTTP API側への影響を小さくする。
 */
class MeetingAiSuggestionService
{
    public function __construct(
        private readonly DemoMeetingSuggestionService $demoService,
        private readonly OpenAiMeetingSuggestionService $openAiService,
    ) {}

    /**
     * 現在設定されているProviderで提案を生成する。
     *
     * @param  array<string, mixed>  $meeting
     * @return array{
     *     result: string,
     *     nextAction: string
     * }
     */
    public function suggest(
        array $meeting,
    ): array {
        $provider = strtolower(
            trim(
                (string) config(
                    'ai.meeting.provider',
                    'demo',
                ),
            ),
        );

        return match ($provider) {
            'demo' => $this->demoService->suggest(
                $meeting,
            ),

            'openai' => $this->openAiService->suggest(
                $meeting,
            ),

            default => throw new RuntimeException(
                "未対応のAI Providerです: {$provider}",
            ),
        };
    }
}
