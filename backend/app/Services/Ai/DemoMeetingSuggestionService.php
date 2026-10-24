<?php

namespace App\Services\Ai;

use Illuminate\Support\Str;

/**
 * Meeting AI公開Demo用Provider。
 *
 * OpenAIなどの外部APIへ通信せず、
 * 入力されたMeeting内容から
 * Demo用の提案Responseを生成する。
 *
 * 外部APIを使用しないため、
 * 公開Portfolioを継続運用しても
 * AI API利用料金は発生しない。
 */
class DemoMeetingSuggestionService implements MeetingAiSuggestionProvider
{
    /**
     * Demo用Meeting提案を生成する。
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
        $title = $this->text(
            $meeting['title']
            ?? null,
        );

        $description = $this->text(
            $meeting['description']
            ?? null,
        );

        $currentResult = $this->text(
            $meeting['result']
            ?? null,
        );

        $currentNextAction = $this->text(
            $meeting['nextAction']
            ?? null,
        );

        /**
         * すでにUserが入力している場合は
         * その内容をDemo提案の元として使用する。
         *
         * 未入力の場合は商談内容を使用する。
         */
        $resultSource =
            $currentResult !== ''
                ? $currentResult
                : $description;

        $nextActionSource =
            $currentNextAction !== ''
                ? $currentNextAction
                : '商談内容を整理し、次回対応の担当・期限・実施内容を確認してください。';

        return [
            'result' => sprintf(
                '【デモ提案】%s：%s',
                $title,
                Str::limit(
                    $resultSource,
                    240,
                    '…',
                ),
            ),

            'nextAction' => sprintf(
                '【デモ提案】%s',
                Str::limit(
                    $nextActionSource,
                    240,
                    '…',
                ),
            ),
        ];
    }

    /**
     * Provider入力値を安全にTextへ変換する。
     */
    private function text(
        mixed $value,
    ): string {
        if (! is_string($value)) {
            return '';
        }

        return trim($value);
    }
}
