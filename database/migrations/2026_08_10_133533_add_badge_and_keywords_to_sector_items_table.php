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
        Schema::table('sector_items', function (Blueprint $table) {
            $table->string('badge')->nullable()->after('url');
            $table->string('keywords')->nullable()->after('badge');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sector_items', function (Blueprint $table) {
            $table->dropColumn(['badge', 'keywords']);
        });
    }
};
