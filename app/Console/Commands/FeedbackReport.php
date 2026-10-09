<?php

namespace App\Console\Commands;

use App\FeedbackCatalog;
use App\FeedbackEstimator;
use DateTimeImmutable;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

#[Signature('feedback:report {week : Closed UTC Monday YYYY-MM-DD} {--output= : Local static snapshot directory}')]
#[Description('Build immutable closed-week aggregate feedback snapshots with uncertainty suppression')]
class FeedbackReport extends Command
{
    public function handle(FeedbackCatalog $catalog, FeedbackEstimator $estimator): int
    {
        $week = $this->argument('week');
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $week);
        if ($parsed === false || $parsed->format('Y-m-d') !== $week || $parsed->format('N') !== '1' || $week >= now('UTC')->startOfWeek()->format('Y-m-d')) {
            $this->error('A closed UTC week starting on Monday is required.');

            return self::FAILURE;
        }
        try {
            $survey = $catalog->survey();
            $rows = DB::connection('metrics')->table('feedback_counters')->where('week_start', $week)->get();
            $diagnostics = [];
            $public = [];
            $counts = [];
            foreach ($rows as $row) {
                if ($row->protocol_version !== FeedbackCatalog::Protocol || ($row->metric_id === 'policy_agreement' && $row->survey_version !== $survey['version'])) {
                    throw new RuntimeException('Protocol or survey mismatch.');
                }
                $id = $row->metric_id === 'result_fit' ? 'result_fit' : $row->proposition_id;
                $counts[$id] ??= [0, 0, 0];
                $counts[$id][(int) $row->category] += (int) $row->count;
            }
            foreach ([['id' => 'result_fit', 'topicId' => '', 'text' => __('public.fit_question')], ...$survey['propositions']] as $item) {
                $report = $estimator->estimate($counts[$item['id']] ?? [0, 0, 0]);
                $diagnostics[$item['id']] = $report;
                $public[] = [...$item, 'status' => $report['status'], ...($report['status'] === 'published' ? ['contributions' => $report['n'], 'estimate' => $report['estimate'], 'intervals' => $report['intervals']] : [])];
            }
            $topics = [];
            foreach (array_unique(array_column($survey['propositions'], 'topicId')) as $topic) {
                $items = array_values(array_filter($survey['propositions'], fn (array $item): bool => $item['topicId'] === $topic));
                $reports = array_map(fn (array $item): array => $estimator->estimate($counts[$item['id']] ?? [0, 0, 0], count($items)), $items);
                $covered = count(array_filter($reports, fn (array $report): bool => $report['status'] === 'published'));
                $summary = ['topicId' => $topic, 'topicName' => $items[0]['topicName'], 'propositions' => count($items), 'coveredPropositions' => $covered, 'status' => $covered === count($items) ? 'published' : 'incomplete_coverage'];
                if ($covered === count($items)) {
                    $summary['agreement'] = array_sum(array_column(array_column($reports, 'estimate'), 2)) / count($items);
                    $agreementIntervals = array_column(array_column($reports, 'intervals'), 2);
                    $summary['interval'] = [array_sum(array_column($agreementIntervals, 0)) / count($items), array_sum(array_column($agreementIntervals, 1)) / count($items)];
                }
                $topics[] = $summary;
            }
            $snapshot = ['schemaVersion' => 1, 'week' => $week, 'protocolVersion' => FeedbackCatalog::Protocol, 'surveyVersion' => $survey['version'], 'kind' => $survey['kind'], 'metrics' => $public, 'topics' => $topics, 'notice' => __('public.report_notice')];
            $directory = $this->option('output') ?: resource_path('feedback-reports');
            $this->writeImmutable($directory.'/'.$week.'.json', json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n");
            $this->writeImmutable(storage_path('app/private/feedback-diagnostics/'.$week.'.json'), json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)."\n");
            $this->info('Closed-week snapshot prepared; suppressed cells contain no public category counts.');

            return self::SUCCESS;
        } catch (Throwable) {
            $this->error('Report unavailable or immutable snapshot differs. Existing files were preserved.');

            return self::FAILURE;
        }
    }

    private function writeImmutable(string $path, string $bytes): void
    {
        if (is_file($path)) {
            if (file_get_contents($path) !== $bytes) {
                throw new RuntimeException('Immutable snapshot differs.');
            }

            return;
        }
        if (! is_dir(dirname($path)) && ! mkdir(dirname($path), 0700, true)) {
            throw new RuntimeException('Snapshot directory unavailable.');
        }
        $temporary = tempnam(dirname($path), '.report-');
        if ($temporary === false) {
            throw new RuntimeException('Snapshot directory unavailable.');
        }
        try {
            if (file_put_contents($temporary, $bytes, LOCK_EX) !== strlen($bytes)) {
                throw new RuntimeException('Snapshot write failed.');
            }
            if (! link($temporary, $path) && (! is_file($path) || file_get_contents($path) !== $bytes)) {
                throw new RuntimeException('Immutable snapshot differs.');
            }
        } finally {
            unlink($temporary);
        }
    }
}
