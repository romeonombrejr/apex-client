<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('storefront.view');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:99'],
            'selected' => ['sometimes', 'boolean'],
            'answers' => ['nullable', 'array'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:10240'],
            'referenced_order_ids' => ['nullable', 'array'],
            'referenced_order_ids.*' => ['integer'],
        ];
    }
}
