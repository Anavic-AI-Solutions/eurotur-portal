<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('search_synonym_terms', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('group_number')->index();
            $table->string('term')->index();
            $table->timestamps();

            $table->unique(['group_number', 'term']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_synonym_terms');
    }
};
