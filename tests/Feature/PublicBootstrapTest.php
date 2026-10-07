<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use RuntimeException;
use Tests\TestCase;

class PublicBootstrapTest extends TestCase
{
    public function test_home_remains_spanish_when_the_browser_prefers_english(): void
    {
        $response = $this->get('/', ['Accept-Language' => 'en-US,en;q=0.9']);

        $response->assertSee('lang="es"', false)
            ->assertSeeText('Estamos preparando el sitio.')
            ->assertSeeText('El comparador y el cuestionario todavía no están disponibles.')
            ->assertHeader('Content-Language', 'es');
    }

    public function test_home_does_not_start_a_public_session_or_set_cookies(): void
    {
        config(['session.driver' => 'database']);

        $response = $this->get('/');

        $response->assertOk()->assertHeaderMissing('Set-Cookie');
    }

    public function test_missing_page_has_a_safe_spanish_error(): void
    {
        $response = $this->get('/missing-page');

        $response->assertNotFound()->assertSeeText('No encontramos esta página.')
            ->assertDontSeeText('missing-page')->assertHeader('Content-Language', 'es');
    }

    public function test_missing_api_page_returns_a_stable_code_without_the_requested_path(): void
    {
        $response = $this->getJson('/api/missing-page');

        $response->assertNotFound()->assertExactJson(['error' => ['code' => 'not_found']]);
    }

    public function test_disabled_questionnaire_does_not_have_a_public_route(): void
    {
        $response = $this->get('/questionnaire');

        $response->assertNotFound()->assertSeeText('No encontramos esta página.');
    }

    public function test_public_home_rejects_submitted_answers(): void
    {
        $response = $this->postJson('/', ['answers' => ['synthetic_question' => 2]]);

        $response->assertMethodNotAllowed()
            ->assertExactJson(['error' => ['code' => 'method_not_allowed']]);
    }

    public function test_unexpected_exception_does_not_expose_developer_diagnostics(): void
    {
        Route::get('/failure-fixture', function (): never {
            throw new RuntimeException('Synthetic internal diagnostic');
        });

        $response = $this->get('/failure-fixture');

        $response->assertInternalServerError()
            ->assertSeeText('Ha ocurrido un problema. Inténtalo de nuevo más tarde.')
            ->assertDontSeeText('Synthetic internal diagnostic');
    }
}
