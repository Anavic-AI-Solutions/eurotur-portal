<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PrepagosRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->with('role:id,name,slug')
                ->orderBy('name')
                ->paginate(20)
                ->through(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->only(['id', 'name', 'slug']),
                ]),
            'roles' => $this->roleOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => $this->roleOptions(),
            'prepagosRoles' => $this->prepagosRoleOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Usuario creado.')]);

        return to_route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => [
                ...$user->only(['id', 'name', 'email', 'role_id', 'prepagos_analista_codigo']),
                'prepagos_role' => $user->prepagos_role?->value,
            ],
            'roles' => $this->roleOptions(),
            'prepagosRoles' => $this->prepagosRoleOptions(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $attributes = $request->validated();

        if (blank($attributes['password'] ?? null)) {
            unset($attributes['password']);
        }

        $user->update($attributes);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Usuario actualizado.')]);

        return to_route('admin.users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, __('No podés eliminar tu propia cuenta.'));

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Usuario eliminado.')]);

        return to_route('admin.users.index');
    }

    /**
     * @return Collection<int, Role>
     */
    private function roleOptions(): Collection
    {
        return Role::query()->orderBy('name')->get(['id', 'name', 'slug']);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function prepagosRoleOptions(): array
    {
        return array_map(
            fn (PrepagosRole $role): array => ['value' => $role->value, 'label' => $role->label()],
            PrepagosRole::cases(),
        );
    }
}
