<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TenantTestCase;

class AvatarTest extends TenantTestCase
{
    public function test_a_user_can_upload_a_profile_photo()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('profile.avatar.update'), [
                'avatar' => UploadedFile::fake()->image('me.png', 200, 200),
            ])
            ->assertRedirect(route('profile.edit'));

        $user->refresh();
        $this->assertNotNull($user->avatar_path);
        $this->assertNotNull($user->avatar);
        Storage::disk('public')->assertExists($user->avatar_path);
    }

    public function test_replacing_the_photo_deletes_the_old_file()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('profile.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('old.png'),
        ]);
        $oldPath = $user->refresh()->avatar_path;

        $this->actingAs($user)->post(route('profile.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('new.png'),
        ]);

        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($user->refresh()->avatar_path);
    }

    public function test_removing_the_photo_clears_path_and_file()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('profile.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('me.png'),
        ]);
        $path = $user->refresh()->avatar_path;

        $this->actingAs($user)
            ->delete(route('profile.avatar.destroy'))
            ->assertRedirect(route('profile.edit'));

        $this->assertNull($user->refresh()->avatar_path);
        $this->assertNull($user->avatar);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_non_image_uploads_are_rejected()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('profile.avatar.update'), [
                'avatar' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('avatar');

        $this->assertNull($user->refresh()->avatar_path);
    }
}
