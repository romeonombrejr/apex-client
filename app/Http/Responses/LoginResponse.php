<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        $redirect = $user->hasAnyPermission([
            'users.manage',
            'roles.manage',
            'permissions.manage',
            'settings.manage',
            'backup.manage',
            'files.manage',
            'audit-logs.view',
        ]) ? '/admin/dashboard' : '/dashboard';

        return redirect()->intended($redirect);
    }
}
