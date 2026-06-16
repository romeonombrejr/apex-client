<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['media_folder_id', 'name', 'path', 'disk', 'size', 'mime_type'])]
class MediaFile extends Model
{
    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'media_folder_id');
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
