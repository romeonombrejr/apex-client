<?php

namespace App\Http\Requests\Superadmin;

use App\Models\Plan;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenantRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'plan_id' => ['required', Rule::exists('plans', 'id')],
            'enabled_suites' => ['array'],
            'enabled_suites.*' => ['string', Rule::in(array_keys(config('suites', [])))],
        ];
    }

    /**
     * A tenant may only enable suites the selected plan actually unlocks.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $allowed = Plan::find($this->input('plan_id'))?->allowedSuites() ?? [];

            foreach ((array) $this->input('enabled_suites', []) as $suite) {
                if (! in_array($suite, $allowed, true)) {
                    $validator->errors()->add('enabled_suites', "The {$suite} suite is not included in the selected plan.");
                }
            }
        });
    }
}
