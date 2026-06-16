<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    /**
     * Display a listing of all activity log entries.
     */
    public function index(Request $request): Response
    {
        $activities = Activity::query()
            ->with('causer')
            ->when($request->filled('subject_type'), fn ($query) => $query->where('subject_type', $request->string('subject_type')))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Activity $activity) => [
                'id' => $activity->id,
                'description' => $activity->description,
                'causer' => $activity->causer?->name,
                'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                'created_at' => $activity->created_at,
            ]);

        return Inertia::render('admin/audit-logs/index', [
            'activities' => $activities,
            'filters' => $request->only(['subject_type']),
        ]);
    }
}
