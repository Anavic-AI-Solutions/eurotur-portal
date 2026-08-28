<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission as PermissionEnum;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/roles/index', [
            'roles' => Role::query()
                ->withCount(['users', 'permissions'])
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role): array => [
                    'id' => $role->id,
                    'slug' => $role->slug,
                    'name' => $role->name,
                    'description' => $role->description,
                    'is_system' => $role->is_system,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/roles/create', [
            'permissionGroups' => self::permissionGroups(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create([
            'slug' => Str::slug($request->validated('name')),
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
        ]);

        $this->syncPermissions($role, $request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Rol creado.')]);

        return to_route('admin.roles.index');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('admin/roles/edit', [
            'role' => [
                'id' => $role->id,
                'slug' => $role->slug,
                'name' => $role->name,
                'description' => $role->description,
                'is_system' => $role->is_system,
                'permissions' => $role->permissionSlugs(),
            ],
            'permissionGroups' => self::permissionGroups(),
            'locked' => $role->slug === UserRole::Admin->value,
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $role->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
        ]);

        // The admin role always holds the whole catalogue; its matrix is read-only.
        if ($role->slug !== UserRole::Admin->value) {
            $this->syncPermissions($role, $request->validated('permissions', []));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Rol actualizado.')]);

        return to_route('admin.roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_if($role->is_system, 403, __('Los roles del sistema no se pueden eliminar.'));
        abort_if($role->users()->exists(), 403, __('El rol tiene usuarios asignados.'));

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Rol eliminado.')]);

        return to_route('admin.roles.index');
    }

    /**
     * The permission catalogue grouped for the checkbox matrix.
     *
     * @return list<array{key: string, label: string, permissions: list<array{slug: string, label: string}>}>
     */
    private static function permissionGroups(): array
    {
        $groups = [];

        foreach (PermissionEnum::groupLabels() as $key => $label) {
            $groups[] = [
                'key' => $key,
                'label' => $label,
                'permissions' => array_values(array_map(
                    fn (PermissionEnum $permission): array => [
                        'slug' => $permission->value,
                        'label' => $permission->label(),
                    ],
                    array_filter(PermissionEnum::cases(), fn (PermissionEnum $permission): bool => $permission->group() === $key),
                )),
            ];
        }

        return $groups;
    }

    /**
     * @param  list<string>  $slugs
     */
    private function syncPermissions(Role $role, array $slugs): void
    {
        $role->permissions()->sync(Permission::whereIn('slug', $slugs)->pluck('id'));

        // sync() does not fire model events, so the cache must be dropped here.
        $role->flushPermissionCache();
    }
}
