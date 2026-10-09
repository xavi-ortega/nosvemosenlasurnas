<?php

use App\FeedbackCounters;
use Illuminate\Contracts\Console\Kernel;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
for ($i = 0; $i < 10; $i++) {
    if (! $app->make(FeedbackCounters::class)->add('result_fit', '', '', $i % 3)) {
        exit(1);
    }
}
