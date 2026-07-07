<?php

namespace App\Http\Controllers\Admin\Storefront;

use App\Actions\Storefront\PostOrderMessage;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderMessageController extends Controller
{
    public function store(Request $request, Order $order, PostOrderMessage $post): RedirectResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240'],
        ]);

        $post($order, $request->user(), $validated['body'], $request->file('attachment'));

        return back();
    }
}
