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
        Schema::create('bna_daily_rates', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->decimal('cash_buy', 12, 4)->nullable();
            $table->decimal('cash_sell', 12, 4);
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bna_daily_rates');
    }
};
