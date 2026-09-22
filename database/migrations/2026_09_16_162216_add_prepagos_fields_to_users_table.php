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
        Schema::table('users', function (Blueprint $table) {
            $table->string('prepagos_role')->nullable()->after('role_id');
            $table->unsignedTinyInteger('prepagos_analista_codigo')->nullable()->after('prepagos_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['prepagos_role', 'prepagos_analista_codigo']);
        });
    }
};
