<?php

namespace App\Http\Requests\Admin\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class SaveOrderStatusRequest extends FormRequest
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
            'color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'is_default' => ['boolean'],
            'is_completed' => ['boolean'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
