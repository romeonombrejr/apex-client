<?php

namespace Tests\Feature\Admin;

use App\Models\Theme;
use App\Models\User;
use App\Support\ThemeCss;
use Database\Factories\ThemeFactory;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TenantTestCase;

class ThemeManagementTest extends TenantTestCase
{
    protected function admin(): User
    {
        Permission::firstOrCreate(['name' => 'settings.manage', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $role->givePermissionTo('settings.manage');

        return User::factory()->create()->assignRole('admin');
    }

    protected function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'My Theme',
            'light' => ThemeFactory::LIGHT,
            'dark' => ThemeFactory::DARK,
            'radius' => '0.5rem',
            'fonts' => ['sans' => 'Inter', 'serif' => null, 'mono' => null],
        ], $overrides);
    }

    public function test_index_requires_permission()
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.themes.index'))
            ->assertForbidden();

        $this->actingAs($this->admin())
            ->get(route('admin.themes.index'))
            ->assertOk();
    }

    public function test_can_store_a_theme_with_various_color_formats()
    {
        $light = ThemeFactory::LIGHT;
        $light['primary'] = 'oklch(0.55 0.2 260)';
        $light['accent'] = '#ff8800';
        $light['ring'] = 'var(--primary)';

        $this->actingAs($this->admin())
            ->post(route('admin.themes.store'), $this->payload(['light' => $light]))
            ->assertRedirect(route('admin.themes.index'));

        $this->assertDatabaseHas('themes', ['name' => 'My Theme']);
    }

    #[DataProvider('maliciousValues')]
    public function test_store_rejects_unsafe_or_invalid_values(array $overrides)
    {
        $this->actingAs($this->admin())
            ->post(route('admin.themes.store'), $this->payload($overrides))
            ->assertSessionHasErrors();

        $this->assertDatabaseCount('themes', 0);
    }

    public static function maliciousValues(): array
    {
        $light = ThemeFactory::LIGHT;

        return [
            'style breakout' => [['light' => ['primary' => '</style><script>'] + $light]],
            'semicolon' => [['light' => ['primary' => 'red; color: blue'] + $light]],
            'url()' => [['light' => ['primary' => 'url(evil.png)'] + $light]],
            'too long' => [['light' => ['primary' => str_repeat('a', 130)] + $light]],
            'missing key' => [['light' => collect($light)->except('primary')->all()]],
            'bad radius' => [['radius' => '10']],
            'unknown font' => [['fonts' => ['sans' => 'Comic Papyrus', 'serif' => null, 'mono' => null]]],
        ];
    }

    public function test_unknown_variable_keys_are_stripped()
    {
        $light = ThemeFactory::LIGHT;
        $light['evil'] = 'oklch(0.5 0.1 200)';

        $this->actingAs($this->admin())
            ->post(route('admin.themes.store'), $this->payload(['light' => $light]))
            ->assertRedirect();

        $this->assertArrayNotHasKey('evil', Theme::first()->light);
    }

    public function test_activation_is_exclusive()
    {
        $a = Theme::factory()->active()->create();
        $b = Theme::factory()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.themes.activate', $b))
            ->assertStatus(302);

        $this->assertFalse($a->fresh()->is_active);
        $this->assertTrue($b->fresh()->is_active);
        $this->assertSame($b->id, Theme::activePayload()['id']);
    }

    public function test_reset_deactivates_all_themes()
    {
        Theme::factory()->active()->create();

        $this->actingAs($this->admin())
            ->post(route('admin.themes.reset'))
            ->assertStatus(302);

        $this->assertSame(0, Theme::where('is_active', true)->count());
        $this->assertNull(Theme::activePayload());
    }

    public function test_active_payload_contains_compiled_css_and_font_links()
    {
        Theme::factory()->active()->create([
            'fonts' => ['sans' => 'Inter', 'serif' => null, 'mono' => null],
        ]);

        $payload = Theme::activePayload();

        $this->assertStringContainsString(':root {', $payload['css']);
        $this->assertStringContainsString('--primary:', $payload['css']);
        $this->assertNotEmpty($payload['fontLinks']);
    }

    public function test_compile_drops_tampered_values_at_read_time()
    {
        $theme = Theme::factory()->create();

        // Simulate a row tampered directly in the database, bypassing validation.
        DB::table('themes')->where('id', $theme->id)->update([
            'light' => json_encode(['primary' => '</style>'] + ThemeFactory::LIGHT),
        ]);

        $css = ThemeCss::compile($theme->fresh());

        $this->assertStringNotContainsString('</style>', $css);
    }
}
