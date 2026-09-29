<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ProfileValidationRules;
use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
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
            'prepagos_analista_codigo' => [
                Rule::requiredIf(function (): bool {
                    $role = Role::find((int) $this->input('role_id'));

                    return $role !== null && in_array(Permission::PrepagosVerBandeja->value, $role->permissionSlugs(), true);
                }),
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
            'prepagos_analista_codigo.required' => 'Este rol tiene habilitada la vista "Mi Bandeja": hace falta un código de analista (1 a 9).',
        ];
    }
}
