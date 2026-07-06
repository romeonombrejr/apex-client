<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'service_id', 'quantity', 'selected', 'form_answers', 'price_snapshot'])]
class CartItem extends Model
{
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'selected' => 'boolean',
            'form_answers' => 'array',
            'price_snapshot' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Whether every required field on the attached form has a non-empty answer.
     * An item with no form (or no required fields) is always complete.
     */
    public function isComplete(): bool
    {
        $form = $this->service->form;

        if (! $form) {
            return true;
        }

        $answers = $this->form_answers ?? [];

        foreach ($form->fields as $field) {
            if (! $field->required) {
                continue;
            }

            $value = $answers[$field->key] ?? null;

            if ($value === null || $value === '' || $value === []) {
                return false;
            }
        }

        return true;
    }
}
