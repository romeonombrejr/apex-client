<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['form_id', 'label', 'key', 'type', 'help', 'required', 'options', 'position'])]
class FormField extends Model
{
    /** All supported field types. */
    public const TYPES = ['text', 'textarea', 'number', 'date', 'select', 'radio', 'checkbox', 'file'];

    /** Types whose `options` list is meaningful. */
    public const CHOICE_TYPES = ['select', 'radio', 'checkbox'];

    protected function casts(): array
    {
        return [
            'required' => 'boolean',
            'options' => 'array',
        ];
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }
}
