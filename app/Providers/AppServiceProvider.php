<?php

namespace App\Providers;

use App\FeedbackCatalog;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer('components.layout', function (\Illuminate\View\View $view): void {
            $view->with('feedbackConfig', app(FeedbackCatalog::class)->publicConfig());
        });
    }
}
