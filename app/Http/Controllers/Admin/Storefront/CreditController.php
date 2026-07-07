<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Storefront\AdjustCreditRequest;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CreditController extends Controller
{
    public function index(): Response
    {
        $clients = User::role('client')->orderBy('name')->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'balance' => $user->creditBalance(),
            ]);

        return Inertia::render('admin/storefront/credits/index', [
            'clients' => $clients,
        ]);
    }

    public function store(AdjustCreditRequest $request): RedirectResponse
    {
        $user = User::findOrFail($request->user_id);
        $amount = (float) $request->amount;

        if ($amount < 0 && $user->creditBalance() + $amount < 0) {
            throw ValidationException::withMessages([
                'amount' => __('This would put the balance below zero.'),
            ]);
        }

        CreditTransaction::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'type' => $amount > 0 ? 'topup' : 'adjustment',
            'note' => $request->note,
            'created_by' => $request->user()->id,
        ]);

        activity()->causedBy($request->user())->performedOn($user)
            ->withProperties(['amount' => $amount])->log('Adjusted credits.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Credits adjusted.')]);

        // Return to wherever the adjustment was made (index or ledger) so the
        // balance refreshes in place.
        return back();
    }

    public function show(User $user): Response
    {
        $transactions = CreditTransaction::with('creator:id,name')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (CreditTransaction $t) => [
                'id' => $t->id,
                'amount' => (float) $t->amount,
                'type' => $t->type,
                'note' => $t->note,
                'by' => $t->creator?->name,
                'created_at' => $t->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/storefront/credits/show', [
            'client' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'balance' => $user->creditBalance(),
            ],
            'transactions' => $transactions,
        ]);
    }
}
