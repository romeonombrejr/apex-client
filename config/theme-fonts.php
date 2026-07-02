<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default (built-in) font
    |--------------------------------------------------------------------------
    |
    | Served by the Vite Bunny fonts plugin (see vite.config.ts). A theme that
    | selects this family (or null) produces no runtime font override and no
    | extra Bunny <link> — it is already loaded.
    |
    */

    'default' => 'Instrument Sans',

    'bunny_url' => 'https://fonts.bunny.net/css',

    /*
    |--------------------------------------------------------------------------
    | Curated font catalog
    |--------------------------------------------------------------------------
    |
    | Families a tenant may pick from, grouped by category. Names must match the
    | Bunny/Google catalog. Used for validation (Rule::in) and to build the
    | Bunny stylesheet URL for the active theme.
    |
    */

    'families' => [
        // sans
        ['family' => 'Instrument Sans', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Inter', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Roboto', 'category' => 'sans', 'weights' => [400, 500, 700]],
        ['family' => 'Open Sans', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Poppins', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Montserrat', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Nunito', 'category' => 'sans', 'weights' => [400, 600, 700]],
        ['family' => 'Work Sans', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'DM Sans', 'category' => 'sans', 'weights' => [400, 500, 700]],
        ['family' => 'Outfit', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Plus Jakarta Sans', 'category' => 'sans', 'weights' => [400, 500, 600, 700]],

        // serif
        ['family' => 'Merriweather', 'category' => 'serif', 'weights' => [400, 700]],
        ['family' => 'Lora', 'category' => 'serif', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Playfair Display', 'category' => 'serif', 'weights' => [400, 500, 600, 700]],
        ['family' => 'Source Serif 4', 'category' => 'serif', 'weights' => [400, 600, 700]],
        ['family' => 'PT Serif', 'category' => 'serif', 'weights' => [400, 700]],

        // mono
        ['family' => 'JetBrains Mono', 'category' => 'mono', 'weights' => [400, 500, 700]],
        ['family' => 'Fira Code', 'category' => 'mono', 'weights' => [400, 500, 700]],
        ['family' => 'Source Code Pro', 'category' => 'mono', 'weights' => [400, 500, 700]],
        ['family' => 'IBM Plex Mono', 'category' => 'mono', 'weights' => [400, 500, 700]],
        ['family' => 'Space Mono', 'category' => 'mono', 'weights' => [400, 700]],
    ],

];
