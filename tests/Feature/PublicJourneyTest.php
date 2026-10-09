<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicJourneyTest extends TestCase
{
    public function test_public_surfaces_are_spanish_stateless_and_have_security_headers(): void
    {
        config(['session.driver' => 'database']);
        foreach (['/', '/comparison', '/questionnaire', '/sources', '/privacy', '/method', '/accessibility'] as $path) {
            $this->get($path, ['Accept-Language' => 'en-US'])->assertOk()
                ->assertHeader('Content-Language', 'es')->assertHeaderMissing('Set-Cookie')
                ->assertHeader('Referrer-Policy', 'no-referrer')
                ->assertHeader('X-Content-Type-Options', 'nosniff')
                ->assertDontSee('public.')->assertDontSee('site.');
        }
    }

    public function test_quiz_profiles_and_retired_authentication_have_no_endpoint(): void
    {
        foreach (['/api/questionnaire', '/api/results', '/api/answers'] as $path) {
            $this->postJson($path, ['answers' => ['private-fixture' => 2]])->assertNotFound()
                ->assertDontSee('private-fixture')->assertHeaderMissing('Set-Cookie');
        }
        foreach (['/login', '/register', '/editorial'] as $path) {
            $this->get($path)->assertNotFound()->assertSeeText('No encontramos esta página.');
        }
    }
}
