<?php

namespace App\Http\Requests\Portal;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSearchSynonymTermRequest extends FormRequest
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
     * The frontend always sends a concrete group_number: either the number
     * of the group the term is being added to, or the next free number when
     * the user clicked "nuevo grupo" — so there's no null/"unassigned group"
     * case to handle here.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'group_number' => ['required', 'integer', 'min:1'],
            'term' => [
                'required',
                'string',
                'max:255',
                Rule::unique('search_synonym_terms', 'term')->where('group_number', $this->input('group_number')),
            ],
        ];
    }
}
