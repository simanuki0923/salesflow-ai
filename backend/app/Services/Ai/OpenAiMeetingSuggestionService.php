<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use JsonException;
use RuntimeException;

/**
 * OpenAIを利用してMeetingの営業支援提案を生成するService。
 *
 * ControllerへOpenAI固有のRequest構造を持ち込まず、
 *
 * Controller
 *   ↓
 * OpenAiMeetingSuggestionService
 *   ↓
 * OpenAI Responses API
 *
 * と責務を分離する。
 *
 * このServiceはDBを更新しない。
 * AIから提案を取得して返すことだけを担当する。
 */
class OpenAiMeetingSuggestionService
{
    /**
     * Meeting内容から、
     *
     * ・商談結果の要約
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
    ): array {
        $apiKey = trim(
            (string) config(
                'services.openai.api_key',
            ),
        );

        if ($apiKey === '') {
            throw new RuntimeException(
                'OpenAI API Keyが設定されていません。',
            );
        }

        $model = trim(
            (string) config(
                'services.openai.model',
            ),
        );

        if ($model === '') {
            throw new RuntimeException(
                'OpenAI Modelが設定されていません。',
            );
        }

        $baseUrl = rtrim(
            (string) config(
                'services.openai.base_url',
            ),
            '/',
        );

        if ($baseUrl === '') {
            throw new RuntimeException(
                'OpenAI Base URLが設定されていません。',
            );
        }

        /**
         * 現在Userが入力済みの内容もAIへ渡す。
         *
         * 未入力の場合は「未入力」と明示して、
         * AIが存在しない情報を入力済みと誤認しないようにする。
         */
        $currentResult =
            $this->nullableText(
                $meeting['result']
                ?? null,
            );

        $currentNextAction =
            $this->nullableText(
                $meeting['nextAction']
                ?? null,
            );

        $input = implode(
            "\n\n",
            [
                '【商談名】'
                    ."\n"
                    .$meeting['title'],

                '【商談内容・メモ】'
                    ."\n"
                    .$meeting['description'],

                '【現在入力されている商談結果】'
                    ."\n"
                    .$currentResult,

                '【現在入力されている次回対応】'
                    ."\n"
                    .$currentNextAction,
            ],
        );

        /**
         * Responses APIへStructured Outputを要求する。
         *
         * result / nextActionだけを持つJSON Schemaへ
         * 出力形式を固定することで、
         * FrontendがAIの自由形式Textを解析する必要をなくす。
         *
         * store=false:
         * Application側で会話履歴として保存する用途ではないため、
         * Response保存を無効化する。
         */
        $response = Http::withToken(
            $apiKey,
        )
            ->acceptJson()
            ->asJson()
            ->timeout(30)
            ->post(
                "{$baseUrl}/responses",
                [
                    'model' => $model,

                    'store' => false,

                    'instructions' => implode(
                        "\n",
                        [
                            'あなたは法人営業担当者を支援するAIです。',
                            '入力された商談情報だけを根拠にしてください。',
                            '入力されていない事実・金額・日付・顧客意向を推測で断定しないでください。',
                            'resultには商談内容を簡潔に整理した商談結果案を日本語で記載してください。',
                            'nextActionには担当者が次に実施すべき具体的な対応案を日本語で記載してください。',
                            '営業担当者が確認・修正してから保存する前提の提案として作成してください。',
                        ],
                    ),

                    'input' => $input,

                    'max_output_tokens' => 700,

                    'text' => [
                        'format' => [
                            'type' => 'json_schema',

                            'name' => 'meeting_ai_suggestion',

                            'strict' => true,

                            'schema' => [
                                'type' => 'object',

                                'properties' => [
                                    'result' => [
                                        'type' => 'string',

                                        'description' => '商談内容を整理した商談結果案',
                                    ],

                                    'nextAction' => [
                                        'type' => 'string',

                                        'description' => '営業担当者が次に行う具体的な対応案',
                                    ],
                                ],

                                'required' => [
                                    'result',
                                    'nextAction',
                                ],

                                'additionalProperties' => false,
                            ],
                        ],
                    ],
                ],
            )
            ->throw()
            ->json();

        if (! is_array($response)) {
            throw new RuntimeException(
                'OpenAI API Responseを取得できませんでした。',
            );
        }

        /**
         * Responses APIのoutputには、
         * ModelによってMessage以外のItemが
         * 含まれる可能性がある。
         *
         * output[0]と決め打ちせず、
         * content内のoutput_textを探索する。
         */
        $outputText =
            $this->findOutputText(
                $response,
            );

        if ($outputText === null) {
            throw new RuntimeException(
                'OpenAI API Responseに提案内容がありません。',
            );
        }

        try {
            $suggestion =
                json_decode(
                    $outputText,
                    true,
                    512,
                    JSON_THROW_ON_ERROR,
                );
        } catch (JsonException $exception) {
            throw new RuntimeException(
                'OpenAI API ResponseのJSON解析に失敗しました。',
                previous: $exception,
            );
        }

        if (
            ! is_array($suggestion)
            || ! isset(
                $suggestion['result'],
                $suggestion['nextAction'],
            )
            || ! is_string(
                $suggestion['result'],
            )
            || ! is_string(
                $suggestion['nextAction'],
            )
        ) {
            throw new RuntimeException(
                'OpenAI API Responseの形式が不正です。',
            );
        }

        return [
            'result' => trim(
                $suggestion['result'],
            ),

            'nextAction' => trim(
                $suggestion['nextAction'],
            ),
        ];
    }

    /**
     * nullable TextをPrompt表示用へ変換する。
     */
    private function nullableText(
        mixed $value,
    ): string {
        if (! is_string($value)) {
            return '未入力';
        }

        $value = trim($value);

        return $value === ''
            ? '未入力'
            : $value;
    }

    /**
     * Responses API Responseから
     * output_textを探索する。
     *
     * @param  array<string, mixed>  $response
     */
    private function findOutputText(
        array $response,
    ): ?string {
        $output =
            $response['output']
            ?? null;

        if (! is_array($output)) {
            return null;
        }

        foreach ($output as $item) {
            if (! is_array($item)) {
                continue;
            }

            $content =
                $item['content']
                ?? null;

            if (! is_array($content)) {
                continue;
            }

            foreach (
                $content as $part
            ) {
                if (
                    is_array($part)
                    && (
                        $part['type']
                        ?? null
                    ) === 'output_text'
                    && is_string(
                        $part['text']
                        ?? null,
                    )
                ) {
                    return $part['text'];
                }
            }
        }

        return null;
    }
}
