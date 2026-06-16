<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of all permissions.
     */
    public function index(Request $request): Response
    {
        $permissions = Permission::query()
            ->when($request->filled('group'), fn ($query) => $query->where('group', $request->string('group')))
            ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->string('search').'%'))
            ->withCount('roles')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->map(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'group' => $permission->group,
                'roles_count' => $permission->roles_count,
                'created_at' => $permission->created_at,
            ]);

        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions,
            'groups' => Permission::query()->whereNotNull('group')->distinct()->orderBy('group')->pluck('group'),
            'filters' => $request->only(['group', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        return Inertia::render('admin/permissions/create');
    }

    /**
     * Store a newly created permission.
     */
    public function store(StorePermissionRequest $request): RedirectResponse
    {
        $permission = Permission::create([
            'name' => $request->name,
            'group' => $request->group,
            'guard_name' => 'web',
        ]);

        activity()->causedBy($request->user())->performedOn($permission)->log('Created permission.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permission created.')]);

        return to_route('admin.permissions.index');
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission): Response
    {
        return Inertia::render('admin/permissions/edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'group' => $permission->group,
            ],
        ]);
    }

    /**
     * Update the specified permission.
     */
    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        $permission->update([
            'name' => $request->name,
            'group' => $request->group,
        ]);

        activity()->causedBy($request->user())->performedOn($permission)->log('Updated permission.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permission updated.')]);

        return to_route('admin.permissions.index');
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Request $request, Permission $permission): RedirectResponse
    {
        abort_if($permission->roles()->exists(), 403, 'Cannot delete a permission that is assigned to a role.');

        activity()->causedBy($request->user())->performedOn($permission)->log('Deleted permission.');

        $permission->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permission deleted.')]);

        return to_route('admin.permissions.index');
    }
}
