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

    public function test_home_exposes_only_the_fixed_public_release_date(): void
    {
        $this->get('/')->assertSeeText('Edición de fuentes: 2026-10-09')->assertSeeText('Demo con candidaturas');
    }

    public function test_method_aliases_keep_the_visual_example_and_exact_calculation_readable_without_javascript(): void
    {
        config(['evidence.directory' => sys_get_temp_dir().'/missing-information-bank-'.bin2hex(random_bytes(8))]);

        foreach (['/method', '/how-it-works'] as $path) {
            $response = $this->get($path)->assertOk()->assertHeaderMissing('Set-Cookie')
                ->assertSee('data-method-example', false)
                ->assertSeeText('Ejemplo con cinco decisiones de igual peso.')
                ->assertSee('data-method-control hidden', false)
                ->assertSee('data-open-calculation hidden', false)
                ->assertSee('<template data-calculation-content>', false)
                ->assertSee('href="#calculation-detail"', false)
                ->assertSee('id="calculation-detail"', false)
                ->assertSeeText('1 − |respuesta − postura| / 4')
                ->assertSeeText('Empiezas con 20 preguntas de diez temas.');
            $markup = $this->informationMarkup($response->getContent());
            $this->assertStringNotContainsString('<details', $markup);
            $this->assertStringNotContainsString('disabled', $markup);
            $this->assertStringNotContainsString('ui_example_', $markup);
        }
    }

    public function test_support_answers_are_visible_and_describe_the_independent_journeys(): void
    {
        config(['evidence.directory' => sys_get_temp_dir().'/missing-information-bank-'.bin2hex(random_bytes(8))]);

        foreach (['/help', '/privacy', '/accessibility'] as $path) {
            $response = $this->get($path)->assertOk()->assertHeaderMissing('Set-Cookie')
                ->assertSee('class="information-answers"', false)
                ->assertDontSee('<details', false)
                ->assertDontSee('cleanup.');
            $markup = $this->informationMarkup($response->getContent());
            $this->assertStringNotContainsString('Revisar esta respuesta', $markup);
            $this->assertStringNotContainsString('tema a tema', $markup);
        }
        $this->get('/help')->assertSeeText('Esta comparación es independiente de tus respuestas al test.');
        $this->get('/privacy')->assertSeeText('Se borran al recargar o cerrar esta pestaña.')
            ->assertSeeText('Esta edición no recoge valoraciones ni métricas de uso.');
        $this->get('/accessibility')->assertSeeText('Cerrar, Escape o pulsar el fondo lo cierran');
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

    private function informationMarkup(string $html): string
    {
        $document = new \DOMDocument;
        $document->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
        $article = new \DOMXPath($document)->query('//*[@id="app"]/article[@data-information-section]')->item(0);
        $this->assertInstanceOf(\DOMElement::class, $article);

        return $document->saveHTML($article);
    }
}
