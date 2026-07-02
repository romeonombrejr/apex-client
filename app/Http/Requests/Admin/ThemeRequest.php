<?php

namespace App\Http\Requests\Admin;

use App\Support\ThemeCss;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('settings.manage');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $keys = implode(',', ThemeCss::KEYS);
        $value = ['required', 'string', 'max:120', 'regex:'.ThemeCss::VALUE_PATTERN, 'not_regex:/url|expression/i'];
        $families = collect(config('theme-fonts.families'))->pluck('family')->all();

        return [
            'name' => [
                'required', 'string', 'max:100',
                Rule::unique('themes', 'name')->ignore($this->route('theme')),
            ],

            'light' => ['required', 'array', "required_array_keys:{$keys}"],
            'light.*' => $value,

            'dark' => ['required', 'array', "required_array_keys:{$keys}"],
            'dark.*' => $value,

            'radius' => ['nullable', 'string', 'max:20', 'regex:'.ThemeCss::RADIUS_PATTERN],

            'fonts' => ['nullable', 'array'],
            'fonts.sans' => ['nullable', 'string', Rule::in($families)],
            'fonts.serif' => ['nullable', 'string', Rule::in($families)],
            'fonts.mono' => ['nullable', 'string', Rule::in($families)],
        ];
    }

    /**
     * Reject any color key outside the known variable set (defense-in-depth on
     * top of required_array_keys, which only checks presence, not absence).
     */
    protected function prepareForValidation(): void
    {
        foreach (['light', 'dark'] as $mode) {
            $map = $this->input($mode);

            if (is_array($map)) {
                $this->merge([
                    $mode => array_intersect_key($map, array_flip(ThemeCss::KEYS)),
                ]);
            }
        }
    }
}
