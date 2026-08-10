<?php

namespace App\Http\Middleware;

use App\Models\UserInvitation;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sessions born from a magic link live and die with their link. The accept
 * flow stamps the session with its link's id; this middleware ends the
 * session as soon as the link expires, its row disappears (revoked, or
 * superseded by a newly minted link), or the row points at a different
 * session. New uses are refused outright while this session is alive
 * (first in wins — see InvitationController), so the repointed branch is
 * the backstop for takeovers after this session went idle, and for session
 * drivers where liveness can't be verified. Enforcement is lazy — the first
 * request after the event is the one that's blocked — which needs no
 * scheduler. Password-born sessions carry no stamp and are never touched;
 * completing onboarding removes the stamp (the invite has converted into a
 * credentialed account).
 */
class EnsureLinkSessionIsValid
{
    public function handle(Request $request, Closure $next): Response
    {
        $session = $request->session();
        $linkId = $session->get('link_session_id');

        if (! $linkId || ! $request->user('web')) {
            return $next($request);
        }

        $invitation = UserInvitation::find($linkId);

        if (
            $invitation === null                                                // revoked or superseded
            || ! $invitation->isUsable()                                        // expired
            || $invitation->session_id !== $session->get('link_session_bound')  // replaced by a newer use
        ) {
            Auth::guard('web')->logout();
            $session->invalidate();
            $session->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => __('Your sign-in link is no longer valid. Ask your administrator for a new one.'),
            ]);
        }

        return $next($request);
    }
}
