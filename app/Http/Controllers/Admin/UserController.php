<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Support\TenantLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index(Request $request): Response
    {
        $currentId = $request->user()->getKey();

        $users = User::with('roles')
            ->with(['invitations' => fn ($query) => $query
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))])
            ->orderBy('name')
            ->get();

        // A consumed link only counts as a live session while its session row
        // still exists (idle timeout may have ended it long ago).
        $aliveSessions = $this->aliveSessionIds(
            $users->flatMap(fn (User $user) => $user->invitations->pluck('session_id'))->filter()->all(),
        );

        $users = $users->map(function (User $user) use ($currentId, $aliveSessions) {
            // At most one unexpired link exists per user (superseded on mint).
            // Links are reusable, so a usable link without a live session
            // shows as available again; with one, as a revocable session.
            $link = $user->invitations->first();
            $session = $link !== null
                && $link->session_id && in_array($link->session_id, $aliveSessions, true);

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'company' => $user->company,
                'role' => $user->roles->first()?->name,
                'created_at' => $user->created_at,
                'activated' => $user->email_verified_at !== null,
                'pending_invite' => $link !== null && ! $session,
                // A link-born session that dies with its link (revocable).
                'link_session' => $session,
                // Meaningful for either state: null = never expires. ISO —
                // the UI renders it in the viewer's timezone (lib/format-date).
                'link_expires_at' => $link?->expires_at?->toIso8601String(),
                // Re-copyable accept URL — valid as long as the link is.
                'link_url' => $link?->url(),
                'is_self' => $user->id === $currentId,
                // Admins can't be impersonated (privilege), nor can you impersonate yourself.
                'impersonatable' => $user->id !== $currentId && ! $user->roles->contains('name', 'admin'),
            ];
        });

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    /**
     * Which of the given session ids still exist in the session store. Only
     * answerable on the database driver; other drivers optimistically report
     * all alive (the enforcement middleware stays authoritative either way).
     *
     * @param  array<int, string>  $ids
     * @return array<int, string>
     */
    protected function aliveSessionIds(array $ids): array
    {
        if ($ids === [] || config('session.driver') !== 'database') {
            return $ids;
        }

        return DB::connection(config('session.connection'))
            ->table(config('session.table', 'sessions'))
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        if (TenantLimits::reachedUserLimit()) {
            throw ValidationException::withMessages([
                'email' => __('Your plan\'s user limit (:max) has been reached. Upgrade to add more users.', ['max' => TenantLimits::maxUsers()]),
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'company' => $request->company,
            'password' => Hash::make($request->password),
        ]);

        // Admin-created accounts have a known password and are vouched for, so
        // treat them as activated (verified) — this both lets them past the
        // `verified` gate without an email round-trip and marks them eligible
        // for passwordless sign-in links rather than onboarding invites.
        $user->forceFill(['email_verified_at' => now()])->save();

        $user->assignRole($request->role);

        activity()->causedBy($request->user())->performedOn($user)->log('Created user.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('admin.users.index');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'company' => $user->company,
                'role' => $user->roles->first()?->name,
            ],
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->fill([
            'name' => $request->name,
            'email' => $request->email,
            'company' => $request->company,
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $user->syncRoles($request->role);

        activity()->causedBy($request->user())->performedOn($user)->log('Updated user.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('admin.users.index');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->is(request()->user()), 403, 'You cannot delete your own account.');

        activity()->causedBy(request()->user())->performedOn($user)->log('Deleted user.');

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('admin.users.index');
    }
}
