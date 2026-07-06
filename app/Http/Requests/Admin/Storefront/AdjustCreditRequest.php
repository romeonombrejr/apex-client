<?php

namespace App\Http\Requests\Admin\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class AdjustCreditRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'not_in:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
