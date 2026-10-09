<?php

namespace App\Http\Controllers;

use App\FeedbackCatalog;
use App\FeedbackCounters;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class FeedbackController extends Controller
{
    public function __invoke(Request $request, FeedbackCatalog $catalog, FeedbackCounters $counters): Response
    {
        $reply = fn (int $status): Response => response()->json(['accepted' => $status === 202], $status)->header('Cache-Control', 'no-store');
        if (! $catalog->enabled()) {
            return $reply(503);
        }
        if ($request->query() !== [] || $request->header('Origin') !== rtrim((string) config('app.url'), '/') || $request->header('Sec-Fetch-Site') !== 'same-origin' || $request->header('X-Feedback-Protocol') !== FeedbackCatalog::Protocol) {
            return $reply(403);
        }
        if ($request->header('Content-Type') !== 'application/json') {
            return $reply(415);
        }
        $length = $request->header('Content-Length');
        if (! is_string($length) || ! ctype_digit($length) || (int) $length > 512) {
            return $reply(413);
        }
        $bytes = $request->getContent();
        if (strlen($bytes) !== (int) $length) {
            return $reply(400);
        }
        $payload = json_decode($bytes, true, 4);
        preg_match_all('/"(?:metricId|protocolVersion|category|surveyVersion|propositionId)"\s*:/', $bytes, $fields);
        if (! is_array($payload) || array_is_list($payload) || count($fields[0]) !== count($payload)) {
            return $reply(422);
        }
        $metric = $payload['metricId'] ?? null;
        if (! in_array($metric, ['result_fit', 'policy_agreement'], true) || ($payload['protocolVersion'] ?? null) !== FeedbackCatalog::Protocol || ! in_array($payload['category'] ?? null, [0, 1, 2], true)) {
            return $reply(422);
        }
        $version = '';
        $proposition = '';
        $keys = ['metricId', 'protocolVersion', 'category'];
        if ($metric === 'policy_agreement') {
            $survey = $catalog->survey();
            if (($payload['surveyVersion'] ?? null) !== $survey['version'] || ! in_array($payload['propositionId'] ?? null, array_column($survey['propositions'], 'id'), true)) {
                return $reply(422);
            }
            $version = $payload['surveyVersion'];
            $proposition = $payload['propositionId'];
            $keys = [...$keys, 'surveyVersion', 'propositionId'];
        }
        if (count($payload) !== count($keys) || array_diff(array_keys($payload), $keys) !== []) {
            return $reply(422);
        }
        try {
            $accepted = $counters->add($metric, $version, $proposition, $payload['category']);

            return $reply($accepted ? 202 : 503);
        } catch (Throwable) {
            return $reply(503);
        }
    }
}
