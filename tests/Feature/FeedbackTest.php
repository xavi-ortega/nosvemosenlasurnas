<?php

namespace Tests\Feature;

use App\FeedbackCatalog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.connections.metrics.database' => ':memory:', 'feedback.enabled' => true, 'feedback.host_approved' => true, 'app.url' => 'http://localhost']);
    }

    private function createCounters(): void
    {
        (require database_path('migrations/2026_10_09_142259_create_feedback_counters.php'))->up();
        $this->travelTo(Carbon::parse('2026-10-09T12:00:00Z'));
    }

    /** @param array<string, mixed> $payload
     * @param  array<string, string>  $headers
     */
    private function submit(array $payload, array $headers = [], string $uri = '/api/feedback'): TestResponse
    {
        $bytes = json_encode($payload, JSON_THROW_ON_ERROR);

        return $this->call('POST', $uri, [], [], [], [
            'CONTENT_TYPE' => 'application/json', 'CONTENT_LENGTH' => (string) strlen($bytes),
            'HTTP_ORIGIN' => 'http://localhost', 'HTTP_SEC_FETCH_SITE' => 'same-origin',
            'HTTP_X_FEEDBACK_PROTOCOL' => FeedbackCatalog::Protocol, ...$headers,
        ], $bytes);
    }

    /** @return array{metricId: string, protocolVersion: string, category: int} */
    private function fit(): array
    {
        return ['metricId' => 'result_fit', 'protocolVersion' => FeedbackCatalog::Protocol, 'category' => 2];
    }

    public function test_disabled_and_unapproved_collection_never_reaches_storage(): void
    {
        config(['feedback.enabled' => false]);
        $this->submit($this->fit())->assertServiceUnavailable()->assertExactJson(['accepted' => false])->assertHeaderMissing('Set-Cookie');
        config(['feedback.enabled' => true, 'feedback.host_approved' => false]);
        $this->submit($this->fit())->assertServiceUnavailable();
        $this->app->detectEnvironment(fn (): string => 'production');
        config(['feedback.host_approved' => true]);
        $this->submit($this->fit())->assertServiceUnavailable();
    }

    public function test_valid_reports_only_increment_weekly_counters_without_events_cookies_or_logs(): void
    {
        $this->createCounters();
        config(['session.driver' => 'database']);
        Log::spy();

        $this->submit($this->fit())->assertStatus(202)->assertExactJson(['accepted' => true])->assertHeaderMissing('Set-Cookie')->assertHeader('Cache-Control', 'no-store, private');
        $this->submit($this->fit())->assertStatus(202);
        $survey = app(FeedbackCatalog::class)->survey();
        $this->submit(['metricId' => 'policy_agreement', 'protocolVersion' => FeedbackCatalog::Protocol, 'category' => 0, 'surveyVersion' => $survey['version'], 'propositionId' => $survey['propositions'][0]['id']])->assertStatus(202);

        $rows = DB::connection('metrics')->table('feedback_counters')->orderBy('metric_id')->get();
        $this->assertCount(2, $rows);
        $this->assertSame(2, $rows[1]->count);
        $this->assertSame(['week_start', 'metric_id', 'survey_version', 'proposition_id', 'protocol_version', 'category', 'count'], array_keys((array) $rows[1]));
        $this->assertSame('2026-10-05', $rows[1]->week_start);
        $this->assertSame(250, DB::connection('metrics')->selectOne('PRAGMA busy_timeout')->timeout);
        Log::shouldNotHaveReceived('error');
        Log::shouldNotHaveReceived('info');
    }

    public function test_profiles_identifiers_bad_categories_and_versions_are_rejected_without_echo_or_writes(): void
    {
        $this->createCounters();
        $invalid = [
            [...$this->fit(), 'answers' => ['private-fixture' => 2]],
            [...$this->fit(), 'party' => 'private-fixture'],
            [...$this->fit(), 'visitId' => 'private-fixture'],
            [...$this->fit(), 'category' => '2'], [...$this->fit(), 'category' => true],
            [...$this->fit(), 'category' => 3], [...$this->fit(), 'protocolVersion' => 'unknown'],
            ['metricId' => 'policy_agreement', 'protocolVersion' => FeedbackCatalog::Protocol, 'category' => 1, 'surveyVersion' => 'unknown', 'propositionId' => 'unknown'],
            ['metricId' => 'policy_agreement', 'protocolVersion' => FeedbackCatalog::Protocol, 'category' => 1],
        ];
        foreach ($invalid as $payload) {
            $this->submit($payload)->assertUnprocessable()->assertExactJson(['accepted' => false])->assertDontSee('private-fixture')->assertHeaderMissing('Set-Cookie');
        }
        $this->assertSame(0, DB::connection('metrics')->table('feedback_counters')->count());
    }

    public function test_cross_origin_queries_oversized_and_wrong_content_are_refused(): void
    {
        $this->createCounters();
        $this->submit($this->fit(), ['HTTP_ORIGIN' => 'https://hostile.example'])->assertForbidden();
        $this->submit($this->fit(), ['HTTP_SEC_FETCH_SITE' => 'cross-site'])->assertForbidden();
        $this->submit($this->fit(), ['HTTP_X_FEEDBACK_PROTOCOL' => ''])->assertForbidden();
        $this->submit($this->fit(), [], '/api/feedback?profile=private-fixture')->assertForbidden();
        $this->submit($this->fit(), ['CONTENT_LENGTH' => '513'])->assertStatus(413);
        $this->submit($this->fit(), ['CONTENT_TYPE' => 'text/plain'])->assertStatus(415);
        $this->submit($this->fit(), ['CONTENT_LENGTH' => '1'])->assertBadRequest();
        $this->assertSame(0, DB::connection('metrics')->table('feedback_counters')->count());
    }

    public function test_global_anomaly_budget_pauses_collection_until_owner_intervention(): void
    {
        $this->createCounters();
        config(['feedback.minute_budget' => 2]);
        $this->submit($this->fit())->assertStatus(202);
        $this->submit($this->fit())->assertStatus(202);
        $this->submit($this->fit())->assertServiceUnavailable();
        $this->travel(8)->days();
        $this->submit($this->fit())->assertServiceUnavailable();
        $this->assertSame(2, DB::connection('metrics')->table('feedback_counters')->sum('count'));
        $this->assertSame(1, DB::connection('metrics')->table('feedback_control')->value('paused'));
    }

    public function test_weekly_budget_limits_and_next_week_counters_preserve_closed_weeks(): void
    {
        $this->createCounters();
        config(['feedback.weekly_budget' => 2]);
        $this->submit($this->fit())->assertStatus(202);
        $this->travel(8)->days();
        $this->submit($this->fit())->assertStatus(202);
        $this->submit($this->fit())->assertStatus(202);
        $this->submit($this->fit())->assertServiceUnavailable();
        $this->assertSame(3, DB::connection('metrics')->table('feedback_counters')->sum('count'));
        $this->assertSame(2, DB::connection('metrics')->table('feedback_counters')->count());
    }

    public function test_missing_counter_database_safely_skips_reports_without_body_logging(): void
    {
        Log::spy();
        $this->submit($this->fit())->assertServiceUnavailable()->assertExactJson(['accepted' => false]);
        Log::shouldNotHaveReceived('error');
    }
}
