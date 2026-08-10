<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\UserInvitation;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TenantTestCase;

class UserPermissionMatrixTest extends TenantTestCase
{
    /**
     * The staff shape: sees the roster (and can copy existing links from
     * it) but holds none of the mutating user permissions.
     */
    protected function viewer(): User
    {
        Permission::firstOrCreate(['name' => 'users.view', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $role->givePermissionTo('users.view');

        return User::factory()->create()->assignRole('staff');
    }

    public function test_a_viewer_sees_the_roster_including_copyable_link_urls()
    {
        $viewer = $this->viewer();
        $viewer->forceFill(['name' => 'Alice Viewer'])->save();
        $target = User::factory()->create(['name' => 'Zed Target']);
        $url = UserInvitation::issue($target, null, now()->addDay());

        $this->actingAs($viewer)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/users/index')
                ->where('users.1.link_url', $url));
    }

    public function test_a_viewer_cannot_do_anything_else_to_users()
    {
        $viewer = $this->viewer();
        $target = User::factory()->create();

        $this->actingAs($viewer);

        $this->post(route('admin.users.link', $target), ['expires' => '24h'])->assertForbidden();
        $this->delete(route('admin.users.link.revoke', $target))->assertForbidden();
        $this->post(route('admin.users.reset-link', $target))->assertForbidden();
        $this->post(route('admin.users.impersonate', $target))->assertForbidden();
        $this->get(route('admin.users.create'))->assertForbidden();
        $this->post(route('admin.users.store'), [])->assertForbidden();
        $this->post(route('admin.users.invitations.store'), [])->assertForbidden();
        $this->get(route('admin.users.edit', $target))->assertForbidden();
        $this->put(route('admin.users.update', $target), [])->assertForbidden();
        $this->delete(route('admin.users.destroy', $target))->assertForbidden();
    }

    public function test_without_users_view_the_roster_is_forbidden()
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }
}
