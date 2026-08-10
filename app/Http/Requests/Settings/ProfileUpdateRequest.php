<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->profileRules($this->user()->id);

        // Clients set their company once (at signup/onboarding) and cannot
        // change it here: reassigning would expose another company's data
        // (its ClickUp folder and dashboard). Dropping the rule means the
        // field never reaches ->fill(), even if a request forges it. Internal
        // roles may still edit it.
        if (! $this->user()->hasAnyRole(['admin', 'staff'])) {
            unset($rules['company']);
        }

        return $rules;
    }
}
