<?php

namespace App\Http\Requests\Admin\Crm;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceExecutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
            'dry_run' => ['sometimes', 'boolean'],
        ];
    }

    public function dryRun(): bool
    {
        return $this->boolean('dry_run', true);
    }
}
