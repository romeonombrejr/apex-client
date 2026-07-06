<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description'])]
class Form extends Model
{
    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('position');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * The form definition consumed by the client-side renderer (DynamicForm).
     *
     * @return array<string, mixed>
     */
    public function toDefinition(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'fields' => $this->fields->map(fn (FormField $field) => [
                'label' => $field->label,
                'key' => $field->key,
                'type' => $field->type,
                'help' => $field->help,
                'required' => $field->required,
                'options' => $field->options ?? [],
            ])->values(),
        ];
    }
}
