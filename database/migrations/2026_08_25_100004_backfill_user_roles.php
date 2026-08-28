<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Seed the system roles and point every existing user at the role matching
     * the legacy `users.role` slug. Uses the query builder on purpose: data
     * migrations must not depend on models that keep evolving.
     */
    public function up(): void
    {
        $systemRoles = [
            'admin' => 'Administrador',
            'editor' => 'Editor',
            'viewer' => 'Visitante',
        ];

        foreach ($systemRoles as $slug => $name) {
            DB::table('roles')->insertOrIgnore([
                'slug' => $slug,
                'name' => $name,
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $roleIds = DB::table('roles')->pluck('id', 'slug');

        foreach ($roleIds as $slug => $id) {
            DB::table('users')->where('role', $slug)->update(['role_id' => $id]);
        }

        DB::table('users')->whereNull('role_id')->update(['role_id' => $roleIds['viewer']]);
    }

    public function down(): void
    {
        DB::table('users')->update(['role_id' => null]);
        DB::table('roles')->whereIn('slug', ['admin', 'editor', 'viewer'])->delete();
    }
};
