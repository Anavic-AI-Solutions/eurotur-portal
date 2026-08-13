<?php

namespace App\Http\Requests\Portal;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSearchStaticEntryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:2048', Rule::unique('search_static_entries', 'url')->ignore($this->route('entry'))],
            'keywords' => ['nullable', 'string'],
            'sector_label' => ['nullable', 'string', 'max:255'],
            'sector_href' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
