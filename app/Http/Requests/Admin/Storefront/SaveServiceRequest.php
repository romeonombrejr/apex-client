<?php

namespace App\Http\Requests\Admin\Storefront;

use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveServiceRequest extends FormRequest
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
            'type' => ['required', Rule::in(Service::TYPES)],
            'billing_interval' => [
                'nullable',
                Rule::requiredIf($this->input('type') === 'subscription'),
                Rule::in(Service::INTERVALS),
            ],
            'price' => ['required', 'numeric', 'min:0'],
            'form_id' => ['nullable', 'integer', 'exists:forms,id'],
            'service_category_id' => ['nullable', 'integer', 'exists:service_categories,id'],
            'image' => ['nullable', 'image', 'max:5120'],
            'is_active' => ['boolean'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Normalize multipart input: empty selects arrive as '' but should be null.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'form_id' => $this->input('form_id') ?: null,
            'service_category_id' => $this->input('service_category_id') ?: null,
            'billing_interval' => $this->input('billing_interval') ?: null,
            'position' => $this->input('position') === '' ? null : $this->input('position'),
        ]);
    }
}
