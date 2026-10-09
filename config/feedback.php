<?php

return [
    'enabled' => env('METRICS_ENABLED', false),
    'host_approved' => env('METRICS_HOST_APPROVED', false),
    'weekly_budget' => 100000,
    'minute_budget' => 120,
];
