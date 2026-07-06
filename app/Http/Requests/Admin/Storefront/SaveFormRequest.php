<?php

namespace App\Http\Requests\Admin\Storefront;

use App\Models\FormField;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('storefront.manage');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'fields' => ['array'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.key' => ['required', 'string', 'max:255', 'distinct'],
            'fields.*.type' => ['required', Rule::in(FormField::TYPES)],
            'fields.*.help' => ['nullable', 'string', 'max:255'],
            'fields.*.required' => ['boolean'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*' => ['string', 'max:255'],
        ];
    }
}
