<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drops the legacy slug column now that `role_id` is backfilled. Keeping it
     * would shadow the `role()` relation: Eloquent resolves an existing
     * attribute before ever reaching the relationship.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('viewer')->after('email');
        });

        foreach (DB::table('roles')->pluck('slug', 'id') as $id => $slug) {
            DB::table('users')->where('role_id', $id)->update(['role' => $slug]);
        }
    }
};
