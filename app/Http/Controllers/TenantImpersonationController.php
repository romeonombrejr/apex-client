<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TenantImpersonationController extends Controller
{
    /**
     * Start impersonating a tenant user: stash the admin's id and swap the web
     * session to the target. Same-domain (no token dance) with a return path,
     * unlike the super-admin cross-domain impersonation. Route-gated by
     * users.impersonate; admins cannot impersonate other admins or themselves.
     */
    public function store(Request $request, User $user): RedirectResponse
    {
        $admin = $request->user();

        abort_if($user->is($admin), 403, 'You cannot impersonate yourself.');
        abort_if($user->hasRole('admin'), 403, 'You cannot impersonate another administrator.');

        activity()->causedBy($admin)->performedOn($user)->log('Started impersonating user.');

        Auth::guard('web')->login($user);
        $request->session()->put('impersonator_id', $admin->getKey());

        return redirect()->route('dashboard');
    }

    /**
     * Stop impersonating and return to the original admin session. Reachable by
     * the impersonated (non-admin) user, so it lives outside the admin gate.
     */
    public function leave(Request $request): RedirectResponse
    {
        $adminId = $request->session()->pull('impersonator_id');

        if ($adminId && $admin = User::find($adminId)) {
            Auth::guard('web')->login($admin);

            activity()->causedBy($admin)->log('Stopped impersonating user.');

            return to_route('admin.users.index');
        }

        return to_route('dashboard');
    }
}
