<?php

namespace App;

use Illuminate\Support\Facades\DB;

class FeedbackCounters
{
    public function add(string $metric, string $version, string $proposition, int $category): bool
    {
        $connection = DB::connection('metrics');

        return $connection->transaction(function () use ($connection, $metric, $version, $proposition, $category): bool {
            $week = now('UTC')->startOfWeek()->format('Y-m-d');
            $minute = intdiv(now('UTC')->timestamp, 60);
            $control = $connection->table('feedback_control')->where('id', 1)->first();
            if ($control === null || $control->paused) {
                return false;
            }
            $weekly = $control->week_start === $week ? (int) $control->week_count : 0;
            $recent = (int) $control->minute_epoch === $minute ? (int) $control->minute_count : 0;
            if ($weekly >= config('feedback.weekly_budget') || $recent >= config('feedback.minute_budget')) {
                $connection->table('feedback_control')->where('id', 1)->update(['paused' => true]);

                return false;
            }
            $connection->statement('INSERT INTO feedback_counters (week_start, metric_id, survey_version, proposition_id, protocol_version, category, count) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT (week_start, metric_id, survey_version, proposition_id, protocol_version, category) DO UPDATE SET count = count + 1', [$week, $metric, $version, $proposition, FeedbackCatalog::Protocol, $category]);
            $connection->table('feedback_control')->where('id', 1)->update([
                'week_start' => $week, 'week_count' => $weekly + 1,
                'minute_epoch' => $minute, 'minute_count' => $recent + 1,
            ]);

            return true;
        });
    }
}
