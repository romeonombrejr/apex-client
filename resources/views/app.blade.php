<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @if (! empty($branding['seo_description']))
            <meta name="description" content="{{ $branding['seo_description'] }}">
        @endif
        @if (! empty($branding['seo_keywords']))
            <meta name="keywords" content="{{ $branding['seo_keywords'] }}">
        @endif

        @if (! empty($branding['favicon_path']))
            <link rel="icon" href="{{ $branding['favicon_path'] }}">
        @else
            <link rel="icon" href="/favicon.ico" sizes="any">
            <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        @endif
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        {{-- Custom fonts for the active theme (served from Bunny, like @fonts) --}}
        @if (! empty($theme['fontLinks']))
            <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
            @foreach ($theme['fontLinks'] as $fontLink)
                <link rel="stylesheet" href="{{ $fontLink }}" data-app-theme-font>
            @endforeach
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

        {{--
            Loaded after app.css so it overrides the theme defaults. The active
            theme's compiled CSS supersedes the legacy branding primary_color;
            values are sanitized in ThemeCss::compile(), so {!! !!} is safe here.
        --}}
        @if (! empty($theme['css']))
            <style id="app-theme">{!! $theme['css'] !!}</style>
        @elseif (! empty($branding['primary_color']))
            <style id="app-theme">
                :root, .dark {
                    --primary: {{ $branding['primary_color'] }};
                }
            </style>
        @endif

        <x-inertia::head>
            <title>{{ $branding['seo_title'] ?: ($branding['app_name'] ?: config('app.name', 'Laravel')) }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
