<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Storefront\SaveFormRequest;
use App\Models\Form;
use App\Models\FormField;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends Controller
{
    public function index(): Response
    {
        $forms = Form::withCount(['fields', 'services'])->latest()->get()
            ->map(fn (Form $form) => [
                'id' => $form->id,
                'name' => $form->name,
                'description' => $form->description,
                'fields_count' => $form->fields_count,
                'services_count' => $form->services_count,
            ]);

        return Inertia::render('admin/storefront/forms/index', [
            'forms' => $forms,
            'fieldTypes' => FormField::TYPES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/storefront/forms/create', [
            'fieldTypes' => FormField::TYPES,
        ]);
    }

    public function store(SaveFormRequest $request): RedirectResponse
    {
        $form = Form::create($request->only('name', 'description'));
        $this->syncFields($form, $request->input('fields', []));

        activity()->causedBy($request->user())->performedOn($form)->log('Created form.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Form created.')]);

        return to_route('admin.storefront.forms.index');
    }

    public function edit(Form $form): Response
    {
        $form->load('fields');

        return Inertia::render('admin/storefront/forms/edit', [
            'form' => [
                'id' => $form->id,
                'name' => $form->name,
                'description' => $form->description,
                'fields' => $form->fields->map(fn (FormField $field) => [
                    'label' => $field->label,
                    'key' => $field->key,
                    'type' => $field->type,
                    'help' => $field->help,
                    'required' => $field->required,
                    'options' => $field->options ?? [],
                ]),
            ],
            'fieldTypes' => FormField::TYPES,
        ]);
    }

    public function update(SaveFormRequest $request, Form $form): RedirectResponse
    {
        $form->update($request->only('name', 'description'));
        $this->syncFields($form, $request->input('fields', []));

        activity()->causedBy($request->user())->performedOn($form)->log('Updated form.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Form updated.')]);

        return to_route('admin.storefront.forms.index');
    }

    public function destroy(Request $request, Form $form): RedirectResponse
    {
        // Services keep existing (form_id is null-on-delete); they simply lose the form.
        activity()->causedBy($request->user())->performedOn($form)->log('Deleted form.');

        $form->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Form deleted.')]);

        return to_route('admin.storefront.forms.index');
    }

    /**
     * Replace the form's fields from the submitted payload. Rebuilding is safe
     * because responses are keyed by field `key`, not by field id.
     *
     * @param  array<int, array<string, mixed>>  $fields
     */
    protected function syncFields(Form $form, array $fields): void
    {
        $form->fields()->delete();

        foreach (array_values($fields) as $position => $field) {
            $isChoice = in_array($field['type'], FormField::CHOICE_TYPES, true);

            $form->fields()->create([
                'label' => $field['label'],
                'key' => $field['key'],
                'type' => $field['type'],
                'help' => $field['help'] ?? null,
                'required' => (bool) ($field['required'] ?? false),
                'options' => $isChoice ? array_values(array_filter($field['options'] ?? [])) : null,
                'position' => $position,
            ]);
        }
    }
}
