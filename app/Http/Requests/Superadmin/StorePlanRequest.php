<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('superadmin') !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $planId = $this->route('plan')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('plans', 'slug')->ignore($planId)],
            'price' => ['required', 'numeric', 'min:0'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_storage_mb' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'suites' => ['array'],
            'suites.*' => ['string', Rule::in(array_keys(config('suites', [])))],
        ];
    }
}
