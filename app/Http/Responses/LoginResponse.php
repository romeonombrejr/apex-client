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
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.links',
            'users.reset',
            'users.impersonate',
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
