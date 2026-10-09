<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'metrics';

    public function up(): void
    {
        Schema::connection('metrics')->create('feedback_counters', function (Blueprint $table): void {
            $table->string('week_start', 10);
            $table->string('metric_id', 20);
            $table->string('survey_version', 64);
            $table->string('proposition_id', 64);
            $table->string('protocol_version', 64);
            $table->unsignedTinyInteger('category');
            $table->unsignedBigInteger('count');
            $table->primary(['week_start', 'metric_id', 'survey_version', 'proposition_id', 'protocol_version', 'category'], 'feedback_counter_key');
        });
        Schema::connection('metrics')->create('feedback_control', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->boolean('paused')->default(false);
            $table->string('week_start', 10)->default('');
            $table->unsignedBigInteger('week_count')->default(0);
            $table->unsignedBigInteger('minute_epoch')->default(0);
            $table->unsignedInteger('minute_count')->default(0);
        });
        DB::connection('metrics')->table('feedback_control')->insert(['id' => 1]);
    }

    public function down(): void
    {
        Schema::connection('metrics')->dropIfExists('feedback_control');
        Schema::connection('metrics')->dropIfExists('feedback_counters');
    }
};
