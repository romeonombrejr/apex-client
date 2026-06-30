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

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

        {{-- Loaded after app.css so the saved brand color overrides the theme default --}}
        @if (! empty($branding['primary_color']))
            <style>
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
