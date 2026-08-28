<?php

namespace App\Http\Requests\Portal;

use App\Concerns\AuthorizesSectorEditing;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSectorItemRequest extends FormRequest
{
    use AuthorizesSectorEditing;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:2048', 'prohibits:file'],
            'file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif', 'prohibits:url'],
            'keywords' => ['nullable', 'string'],
        ];
    }
}
