<?php

namespace Tests\Feature;

use App\PublicBank;
use Tests\TestCase;

class PublicBankTest extends TestCase
{
    public function test_bank_is_fixed_hash_bound_and_stateless(): void
    {
        config(['session.driver' => 'database']);
        $response = $this->get('/api/bank');
        $response->assertOk()->assertHeaderMissing('Set-Cookie')->assertJsonPath('kind', 'synthetic');
        $this->assertSame(hash('sha256', $response->getContent()), $response->headers->get('X-Evidence-Sha256'));
        $this->assertSame($response->getContent(), app(PublicBank::class)->bytes());
        $this->assertArrayNotHasKey('text', $response->json('documents.0'));
    }

    public function test_private_query_fields_are_rejected_without_echoing_values(): void
    {
        $this->getJson('/api/bank?answers=private-fixture')
            ->assertBadRequest()->assertDontSee('private-fixture')->assertHeaderMissing('Set-Cookie');
    }

    public function test_synthetic_sources_cannot_be_served_as_production_evidence(): void
    {
        $this->app->detectEnvironment(fn (): string => 'production');

        $this->getJson('/api/bank')->assertServiceUnavailable()
            ->assertExactJson(['error' => ['code' => 'unavailable']])->assertHeaderMissing('Set-Cookie');
    }
}
