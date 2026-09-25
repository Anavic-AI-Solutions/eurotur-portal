<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ProfileValidationRules;
use App\Enums\Permission;
use App\Enums\PrepagosRole;
use App\Models\Role;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    use ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user()?->can(Permission::UsersManage->value) === true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email') ?? ''))]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            ...$this->profileRules($user instanceof User ? $user->id : null),
            'password' => ['nullable', 'string', Password::default(), 'confirmed'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'prepagos_role' => [
                'nullable',
                new Enum(PrepagosRole::class),
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (blank($value)) {
                        return;
                    }

                    $role = Role::find((int) $this->input('role_id'));

                    if ($role === null || ! in_array(Permission::PrepagosManage->value, $role->permissionSlugs(), true)) {
                        $fail('Este usuario no tiene el permiso "Gestionar el panel de prepagos". Asignale el rol Supervisor, Analista, o Admin antes de completar esto.');
                    }
                },
            ],
            'prepagos_analista_codigo' => [
                Rule::requiredIf(fn (): bool => $this->input('prepagos_role') === PrepagosRole::Analista->value),
                'nullable',
                'integer',
                'between:1,9',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prepagos_analista_codigo.required' => 'El rol Analista necesita un código de analista (1 a 9).',
        ];
    }
}
