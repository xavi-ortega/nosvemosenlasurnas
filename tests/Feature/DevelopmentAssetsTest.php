<?php

namespace Tests\Feature;

use App\Http\Middleware\PublicHeaders;
use Illuminate\Foundation\Vite as AssetPipeline;
use Illuminate\Support\Facades\Vite;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class DevelopmentAssetsTest extends TestCase
{
    private string $hotFile;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hotFile = tempnam(sys_get_temp_dir(), 'development-assets-');
        Vite::swap((new AssetPipeline)->useHotFile($this->hotFile));
    }

    protected function tearDown(): void
    {
        if (is_file($this->hotFile)) {
            unlink($this->hotFile);
        }

        parent::tearDown();
    }

    public function test_local_hot_assets_and_updates_use_the_same_response_nonce(): void
    {
        $this->app->detectEnvironment(fn (): string => 'local');
        file_put_contents($this->hotFile, 'http://127.0.0.1:5173');

        $response = $this->get('/questionnaire')->assertOk();
        $nonce = Vite::cspNonce();
        $this->assertNotEmpty($nonce);
        $response->assertSee('property="csp-nonce" nonce="'.$nonce.'"', false)
            ->assertSee('http://127.0.0.1:5173/@vite/client', false);

        $policy = $response->headers->get('Content-Security-Policy');
        $this->assertStringContainsString("script-src 'self' http://127.0.0.1:5173 'nonce-{$nonce}'", $policy);
        $this->assertStringContainsString("style-src 'self' http://127.0.0.1:5173 'nonce-{$nonce}'", $policy);
        $this->assertStringContainsString("connect-src 'self' http://127.0.0.1:5173 ws://127.0.0.1:5173", $policy);
        $this->assertStringNotContainsString('unsafe-inline', $policy);
        $this->assertStringNotContainsString('unsafe-eval', $policy);

        $this->get('/questionnaire')->assertOk();
        $this->assertNotSame($nonce, Vite::cspNonce());
    }

    #[DataProvider('strictEnvironments')]
    public function test_non_local_environments_keep_the_strict_policy_with_a_hot_file(string $environment): void
    {
        $this->app->detectEnvironment(fn (): string => $environment);
        file_put_contents($this->hotFile, 'http://localhost:5173');

        $this->get('/questionnaire')->assertOk()
            ->assertHeader('Content-Security-Policy', PublicHeaders::values()['Content-Security-Policy'])
            ->assertDontSee('property="csp-nonce"', false);
    }

    public function test_a_non_loopback_hot_file_does_not_expand_the_local_policy(): void
    {
        $this->app->detectEnvironment(fn (): string => 'local');
        file_put_contents($this->hotFile, 'https://untrusted.example:5173');

        $this->get('/questionnaire')->assertOk()
            ->assertHeader('Content-Security-Policy', PublicHeaders::values()['Content-Security-Policy']);
    }

    public function test_local_compiled_assets_keep_the_strict_policy(): void
    {
        $this->app->detectEnvironment(fn (): string => 'local');
        unlink($this->hotFile);
        $this->withoutVite();
        Vite::useHotFile($this->hotFile);

        $this->get('/questionnaire')->assertOk()
            ->assertHeader('Content-Security-Policy', PublicHeaders::values()['Content-Security-Policy'])
            ->assertDontSee('property="csp-nonce"', false);
    }

    /** @return array<string, array{string}> */
    public static function strictEnvironments(): array
    {
        return ['production' => ['production'], 'testing' => ['testing']];
    }
}
