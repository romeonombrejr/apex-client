<?php

namespace Tests\Feature\Superadmin;

use App\Models\Tenant;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Storage;
use Stancl\Tenancy\Database\Models\Domain;
use Tests\CentralTestCase;

class BackupPageTest extends CentralTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Single unified test DB: context switches are routing-only.
        config(['tenancy.bootstrappers' => []]);
        Storage::fake('local');
    }

    protected function tenant(): Tenant
    {
        return Tenant::withoutEvents(function () {
            $tenant = Tenant::create(['id' => 'acme', 'name' => 'Acme', 'status' => 'active']);
            Domain::create(['domain' => 'acme.test', 'tenant_id' => $tenant->id]);

            return $tenant;
        });
    }

    public function test_the_backups_page_requires_super_admin_auth()
    {
        $this->get(route('superadmin.backups.index'))
            ->assertRedirect(route('superadmin.login'));
    }

    public function test_the_page_lists_central_plus_a_section_per_tenant()
    {
        $this->tenant();

        $this->actingAs($this->superAdmin(), 'superadmin')
            ->get(route('superadmin.backups.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('superadmin/backups')
                ->has('sections', 2)
                ->where('sections.0.scope', 'central')
                ->where('sections.0.central', true)
                ->where('sections.0.healthy', false)
                ->where('sections.1.scope', 'acme')
                ->where('sections.1.label', 'Acme'));
    }

    public function test_central_archives_cannot_be_deleted()
    {
        $this->actingAs($this->superAdmin(), 'superadmin')
            ->delete(route('superadmin.backups.destroy', ['scope' => 'central', 'path' => bin2hex('x')]))
            ->assertForbidden();
    }

    public function test_run_validates_its_scope()
    {
        $this->actingAs($this->superAdmin(), 'superadmin')
            ->post(route('superadmin.backups.run'), [])
            ->assertSessionHasErrors('scope');
    }

    public function test_downloading_a_missing_archive_is_a_404()
    {
        $this->tenant();

        $this->actingAs($this->superAdmin(), 'superadmin')
            ->get(route('superadmin.backups.download', ['scope' => 'acme', 'path' => bin2hex('nope.zip')]))
            ->assertNotFound();
    }

    public function test_the_backup_all_command_is_scheduled()
    {
        $events = collect(app(Schedule::class)->events());

        $this->assertTrue(
            $events->contains(fn ($event) => str_contains((string) $event->command, 'backup:all')),
        );
    }
}
