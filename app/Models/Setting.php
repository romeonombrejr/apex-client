<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['app_name', 'logo_path', 'favicon_path', 'primary_color', 'seo_title', 'seo_description', 'seo_keywords'])]
class Setting extends Model
{
    public static function current(): self
    {
        return self::firstOrCreate(['id' => 1], ['app_name' => config('app.name')]);
    }
}
