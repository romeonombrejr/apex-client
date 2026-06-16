<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMediaFolderRequest;
use App\Models\MediaFile;
use App\Models\MediaFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaFolderController extends Controller
{
    /**
     * Display the contents of a folder (or the root, if none given).
     */
    public function index(Request $request): Response
    {
        $folder = $request->filled('folder') ? MediaFolder::findOrFail($request->integer('folder')) : null;

        $breadcrumbs = collect();
        for ($cursor = $folder; $cursor; $cursor = $cursor->parent) {
            $breadcrumbs->prepend(['id' => $cursor->id, 'name' => $cursor->name]);
        }

        $folders = MediaFolder::query()
            ->when($folder, fn ($query) => $query->where('parent_id', $folder->id), fn ($query) => $query->whereNull('parent_id'))
            ->orderBy('name')
            ->get(['id', 'name']);

        $files = MediaFile::query()
            ->when($folder, fn ($query) => $query->where('media_folder_id', $folder->id), fn ($query) => $query->whereNull('media_folder_id'))
            ->orderBy('name')
            ->get()
            ->map(fn (MediaFile $file) => [
                'id' => $file->id,
                'name' => $file->name,
                'size' => $this->formatBytes($file->size),
                'mime_type' => $file->mime_type,
                'url' => $file->url(),
                'created_at' => $file->created_at,
            ]);

        return Inertia::render('admin/files/index', [
            'currentFolder' => $folder ? ['id' => $folder->id, 'name' => $folder->name] : null,
            'breadcrumbs' => $breadcrumbs,
            'folders' => $folders,
            'files' => $files,
        ]);
    }

    /**
     * Create a new (sub)folder.
     */
    public function store(StoreMediaFolderRequest $request): RedirectResponse
    {
        $folder = MediaFolder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
        ]);

        activity()->causedBy($request->user())->performedOn($folder)->log('Created folder.');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Folder created.')]);

        return to_route('admin.files.index', ['folder' => $request->parent_id]);
    }

    /**
     * Delete a folder and everything inside it.
     */
    public function destroy(Request $request, MediaFolder $mediaFolder): RedirectResponse
    {
        $parentId = $mediaFolder->parent_id;

        $this->deleteFilesRecursively($mediaFolder);

        activity()->causedBy($request->user())->performedOn($mediaFolder)->log('Deleted folder: '.$mediaFolder->name);

        $mediaFolder->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Folder deleted.')]);

        return to_route('admin.files.index', ['folder' => $parentId]);
    }

    protected function deleteFilesRecursively(MediaFolder $folder): void
    {
        foreach ($folder->files as $file) {
            Storage::disk($file->disk)->delete($file->path);
        }

        foreach ($folder->children as $child) {
            $this->deleteFilesRecursively($child);
        }
    }

    protected function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = $bytes > 0 ? min((int) floor(log($bytes, 1024)), count($units) - 1) : 0;

        return round($bytes / (1024 ** $power), 2).' '.$units[$power];
    }
}
