<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreditController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = CreditTransaction::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (CreditTransaction $t) => [
                'id' => $t->id,
                'amount' => (float) $t->amount,
                'type' => $t->type,
                'note' => $t->note,
                'created_at' => $t->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('storefront/credits/index', [
            'balance' => $user->creditBalance(),
            'transactions' => $transactions,
        ]);
    }
}
