<?php

namespace App;

use RuntimeException;
use Throwable;

class FeedbackCatalog
{
    public const string Protocol = 'three_category_randomized_response_v1';

    /** @return array{version: string, kind: string, propositions: list<array{id: string, topicId: string, topicName: string, text: string}>} */
    public function survey(): array
    {
        $bytes = file_get_contents(resource_path('feedback-survey.json'));
        if ($bytes === false || strlen($bytes) > 65536) {
            throw new RuntimeException('Survey unavailable.');
        }
        $survey = json_decode($bytes, true, flags: JSON_THROW_ON_ERROR);
        if (! is_array($survey) || ! is_string($survey['version'] ?? null) || ! preg_match('/\A[a-z0-9_-]{1,64}\z/', $survey['version']) || ! in_array($survey['kind'] ?? null, ['current', 'historical', 'synthetic'], true) || ! is_array($survey['propositions'] ?? null) || count($survey['propositions']) < 1 || count($survey['propositions']) > 100) {
            throw new RuntimeException('Invalid survey contract.');
        }
        $ids = [];
        foreach ($survey['propositions'] as $item) {
            if (! is_array($item) || ! is_string($item['id'] ?? null) || ! preg_match('/\A[a-z0-9_-]{1,64}\z/', $item['id']) || in_array($item['id'], $ids, true) || ! is_string($item['topicId'] ?? null) || ! is_string($item['topicName'] ?? null) || ! is_string($item['text'] ?? null) || trim($item['text']) === '' || strlen($item['text']) > 1600) {
                throw new RuntimeException('Invalid survey proposition.');
            }
            $ids[] = $item['id'];
        }

        return $survey;
    }

    public function enabled(): bool
    {
        if (config('feedback.enabled') !== true || config('feedback.host_approved') !== true) {
            return false;
        }
        try {
            return $this->survey()['kind'] === 'current' || app()->environment(['local', 'testing']);
        } catch (Throwable) {
            return false;
        }
    }

    /** @return array{enabled: bool, protocolVersion: string, survey: array{version: string, kind: string, propositions: list<array{id: string, topicId: string, topicName: string, text: string}>}} */
    public function publicConfig(): array
    {
        try {
            return ['enabled' => $this->enabled(), 'protocolVersion' => self::Protocol, 'survey' => $this->survey()];
        } catch (Throwable) {
            return ['enabled' => false, 'protocolVersion' => self::Protocol, 'survey' => ['version' => '', 'kind' => 'unavailable', 'propositions' => []]];
        }
    }
}
