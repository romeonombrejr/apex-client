<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class StoreCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('storefront.view');
    }

    /**
     * Required fields are intentionally NOT enforced here — clients may add
     * incomplete items to the cart and finish the form later.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'answers' => ['nullable', 'array'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:10240'],
            'referenced_order_ids' => ['nullable', 'array'],
            'referenced_order_ids.*' => ['integer'],
        ];
    }
}
