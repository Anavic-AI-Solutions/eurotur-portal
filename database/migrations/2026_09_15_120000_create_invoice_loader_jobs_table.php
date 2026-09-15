<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_loader_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('job_id')->index();
            $table->string('kind');
            $table->string('original_filename');
            $table->boolean('dry_run')->nullable();
            $table->string('status')->nullable();
            $table->unsignedInteger('polling_attempts')->default(0);
            $table->string('file_path')->nullable();
            $table->string('report_path')->nullable();
            $table->string('log_path')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_loader_jobs');
    }
};
