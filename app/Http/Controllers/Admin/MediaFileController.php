<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMediaFileRequest;
use App\Models\MediaFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaFileController extends Controller
{
    /**
     * Upload one or more files into a folder.
     */
    public function store(StoreMediaFileRequest $request): RedirectResponse
    {
        foreach ($request->file('files') as $file) {
            $mediaFile = MediaFile::create([
                'media_folder_id' => $request->folder_id,
                'name' => $file->getClientOriginalName(),
                'path' => $file->store('media', 'public'),
                'disk' => 'public',
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            activity()->causedBy($request->user())->performedOn($mediaFile)->log('Uploaded file.');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Files uploaded.')]);

        return to_route('admin.files.index', ['folder' => $request->folder_id]);
    }

    /**
     * Delete the specified file.
     */
    public function destroy(Request $request, MediaFile $mediaFile): RedirectResponse
    {
        Storage::disk($mediaFile->disk)->delete($mediaFile->path);

        activity()->causedBy($request->user())->performedOn($mediaFile)->log('Deleted file: '.$mediaFile->name);

        $folderId = $mediaFile->media_folder_id;

        $mediaFile->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('File deleted.')]);

        return to_route('admin.files.index', ['folder' => $folderId]);
    }

    /**
     * Download the specified file.
     */
    public function download(MediaFile $mediaFile): StreamedResponse
    {
        return Storage::disk($mediaFile->disk)->download($mediaFile->path, $mediaFile->name);
    }
}
