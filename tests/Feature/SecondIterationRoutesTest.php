<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SecondIterationRoutesTest extends TestCase
{
    public function test_second_iteration_routes_and_bank_are_stateless_and_local_only(): void
    {
        $directory = sys_get_temp_dir().'/iteration-routes-'.bin2hex(random_bytes(8));
        mkdir($directory, 0700);
        $bytes = (string) file_get_contents(base_path('outputs/quiz-2023-second-iteration-bank.json'));
        $sha = hash('sha256', $bytes);
        file_put_contents($directory.'/'.$sha.'.json', $bytes);
        file_put_contents($directory.'/current.json', json_encode(['sha256' => $sha, 'kind' => 'historical', 'withdrawn' => [], 'history' => []]));
        config(['evidence.directory' => $directory, 'session.driver' => 'database']);

        try {
            foreach (['/', '/questionnaire', '/programmes', '/comparison', '/sources', '/how-it-works', '/method', '/help', '/privacy', '/accessibility'] as $path) {
                $this->get($path)->assertOk()->assertHeaderMissing('Set-Cookie')
                    ->assertSee('Cuestionario 2023')->assertSee('Programas 2023')->assertSee('Cómo funciona');
            }
            foreach (['/method', '/how-it-works'] as $path) {
                $this->get($path)->assertViewHas('page', 'method')
                    ->assertSee('data-information-page="method"', false)
                    ->assertSeeText('Comparamos tus respuestas con lo que dicen los programas de 2023.')
                    ->assertSeeText('Empiezas con 20 preguntas de diez temas.');
            }
            $sources = $this->get('/sources')->assertViewHas('page', 'sources')
                ->assertSeeText('Sin JavaScript puedes consultar aquí las 59 formaciones')
                ->assertSee('data-source-profile="boe-2023-001-p1"', false);
            $this->assertSame(59, substr_count($sources->getContent(), 'data-source-profile='));
            $this->getJson('/api/bank')->assertOk()->assertHeader('X-Evidence-Sha256', $sha)
                ->assertHeaderMissing('Set-Cookie')->assertJsonPath('engineVersion', 'documented-affinity-v2')
                ->assertJsonCount(59, 'programmeProfiles')->assertJsonCount(20, 'starterQuestionIds')
                ->assertJsonPath('programmePolicy', 'common-election-programme-v1')
                ->assertJsonMissingPath('constituencyPositions');
            $this->app->detectEnvironment(fn (): string => 'production');
            $this->getJson('/api/bank')->assertServiceUnavailable()->assertHeaderMissing('Set-Cookie');
        } finally {
            File::deleteDirectory($directory);
        }
    }

    public function test_missing_or_corrupt_bank_keeps_current_recovery_routes_and_disabled_metrics(): void
    {
        $directory = sys_get_temp_dir().'/iteration-unavailable-'.bin2hex(random_bytes(8));
        mkdir($directory, 0700);
        config(['evidence.directory' => $directory, 'session.driver' => 'database']);

        try {
            foreach (['missing', 'corrupt'] as $condition) {
                if ($condition === 'corrupt') {
                    $sha = str_repeat('a', 64);
                    file_put_contents($directory.'/current.json', json_encode(['sha256' => $sha, 'kind' => 'historical', 'withdrawn' => [], 'history' => []]));
                    file_put_contents($directory.'/'.$sha.'.json', 'corrupt release bytes');
                }

                foreach (['/', '/questionnaire', '/programmes', '/comparison', '/sources', '/method', '/how-it-works', '/help', '/privacy', '/accessibility', '/feedback', '/insights'] as $path) {
                    $this->get($path)->assertViewIs('public.app')->assertHeaderMissing('Set-Cookie')
                        ->assertSee('data-iteration="2"', false)
                        ->assertSee('id="information-content-help"', false)
                        ->assertDontSee('threshold_details');
                }
                $this->get('/sources')->assertSeeText('No hemos podido cargar el directorio.')
                    ->assertDontSeeText('Sin JavaScript puedes consultar aquí las 59 formaciones');
                foreach (['/feedback', '/insights'] as $path) {
                    $this->get($path)->assertSee('data-deferred-page=', false)
                        ->assertSeeText('La recogida de valoraciones y las estadísticas de uso están desactivadas.');
                }
                $this->getJson('/api/bank')->assertServiceUnavailable()->assertHeaderMissing('Set-Cookie');
            }
        } finally {
            File::deleteDirectory($directory);
        }
    }

    public function test_legacy_shell_keeps_hidden_current_information_available_for_bank_hydration(): void
    {
        config(['evidence.directory' => resource_path('evidence')]);

        $response = $this->get('/questionnaire')->assertHeaderMissing('Set-Cookie')
            ->assertDontSee('data-iteration="2"', false);

        foreach (['method', 'help', 'privacy', 'accessibility'] as $page) {
            $response->assertSee('<template id="information-content-'.$page.'">', false);
        }
        $response->assertSee('data-return-context hidden', false)
            ->assertSeeText('Quiero cambiar una respuesta');
    }

    public function test_information_remains_available_without_a_bank_or_javascript(): void
    {
        config(['evidence.directory' => sys_get_temp_dir().'/missing-bank-'.bin2hex(random_bytes(8)), 'session.driver' => 'database']);

        foreach ([
            '/method' => ['method', 'Comparamos tus respuestas'],
            '/how-it-works' => ['method', 'Ver el cálculo completo'],
            '/help' => ['help', 'Quiero cambiar una respuesta'],
            '/privacy' => ['privacy', 'Tus respuestas no se envían al servidor.'],
            '/accessibility' => ['accessibility', 'Con teclado'],
        ] as $path => [$page, $text]) {
            $this->get($path)->assertOk()->assertHeaderMissing('Set-Cookie')
                ->assertSee('data-information-page="'.$page.'"', false)
                ->assertSee('aria-busy="false"', false)->assertSeeText($text)
                ->assertSee('href="'.route('home').'"', false)
                ->assertSee('href="'.route('questionnaire').'"', false)
                ->assertSee('href="'.route('programmes').'"', false)
                ->assertDontSee('cleanup.');
        }
    }
}
