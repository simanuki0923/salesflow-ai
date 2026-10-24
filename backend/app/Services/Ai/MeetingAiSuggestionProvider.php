<?php

namespace App\Services\Ai;

/**
 * Meeting AI提案Provider共通Contract。
 *
 * ControllerやApplication Serviceが
 * OpenAI / Demoなどの具体的なProviderへ
 * 直接依存しないための境界。
 */
interface MeetingAiSuggestionProvider
{
    /**
     * Meeting内容から、
     *
     * ・商談結果案
     * ・次回対応案
     *
     * を生成する。
     *
     * @param  array<string, mixed>  $meeting
     * @return array{
     *     result: string,
     *     nextAction: string
     * }
     */
    public function suggest(
        array $meeting,
    ): array;
}
