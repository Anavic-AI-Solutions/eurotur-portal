<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Uses raw SQL instead of Schema::table()->change() to avoid adding
     * doctrine/dbal as a dependency for a single column type change. SQLite
     * (used in tests) doesn't enforce varchar length limits, so this is a
     * no-op there — only Postgres needs the explicit ALTER.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE sector_items ALTER COLUMN keywords TYPE text');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE sector_items ALTER COLUMN keywords TYPE varchar(255)');
        }
    }
};
