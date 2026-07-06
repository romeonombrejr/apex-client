# ApexClient — Project Context

## Stack
- Laravel 13, Fortify (auth + 2FA + passkeys), Inertia + React + TypeScript
- shadcn/ui + Tailwind, Sonner toasts, spatie/laravel-permission v8, laravel/wayfinder
- SQLite (local dev), pnpm

## Vision
A client portal inspired by Wayfront (formerly SPP). Clients can order products/services. Admins can create customised forms per product. Currently building the admin/user management foundation first.

## What has been built (as of 2026-06-11)

### Backend
| File | Notes |
|------|-------|
| `app/Models/User.php` | HasRoles trait (spatie) added |
| `app/Http/Middleware/HandleInertiaRequests.php` | Shares `auth.roles` array to all pages |
| `bootstrap/app.php` | `role` middleware alias → `Spatie\Permission\Middleware\RoleMiddleware` |
| `routes/admin.php` | All `/admin/*` routes, gated by `['auth','verified','role:admin']` |
| `app/Http/Controllers/Admin/UserController.php` | Full CRUD (no show), blocks self-delete |
| `app/Http/Requests/Admin/StoreUserRequest.php` | name, email, password+confirm, role |
| `app/Http/Requests/Admin/UpdateUserRequest.php` | Same but password nullable |
| `app/Http/Controllers/Admin/RoleController.php` | Full CRUD (no show), blocks delete if users assigned |
| `app/Http/Requests/Admin/StoreRoleRequest.php` | name validation (lowercase, letters, numbers, underscores) |
| `app/Http/Requests/Admin/UpdateRoleRequest.php` | Same as store, unique except self |
| `database/seeders/RoleSeeder.php` | Seeds admin/staff/client roles |
| `database/seeders/DatabaseSeeder.php` | Calls RoleSeeder, creates admin user |

### Frontend
| File | Notes |
|------|-------|
| `resources/js/types/admin.ts` | Role, UserRow, UserFormData, RoleRow, RoleFormData types |
| `resources/js/types/auth.ts` | Added `roles: string[]` to Auth type |
| `resources/js/layouts/admin/layout.tsx` | Admin sub-layout with Users + Roles nav |
| `resources/js/pages/admin/users/index.tsx` | User table with edit/delete per row |
| `resources/js/pages/admin/users/create.tsx` | Create user form |
| `resources/js/pages/admin/users/edit.tsx` | Edit user form (password optional) |
| `resources/js/pages/admin/roles/index.tsx` | Role table with edit/delete per row |
| `resources/js/pages/admin/roles/create.tsx` | Create role form |
| `resources/js/pages/admin/roles/edit.tsx` | Edit role form |
| `resources/js/components/app-sidebar.tsx` | Shows Admin nav item only for role:admin |

### Roles & seeded data
- Roles: `admin`, `staff`, `client` (can be managed via /admin/roles)
- Admin user: `admin@example.com` / `admin1234`

---

## Coding conventions — always follow these

### PHP / Laravel
- PHP 8 attribute-style models: `#[Fillable([...])]`, `#[Hidden([...])]`, `casts()` method (not `$casts` array)
- Controllers in feature sub-namespaces: `Admin\UserController`, `Settings\ProfileController`
- Every mutating action gets its own `FormRequest` in matching sub-namespace (`app/Http/Requests/Admin/`)
- Flash toasts: `Inertia::flash('toast', ['type' => 'success', 'message' => '...'])`
- Redirects: `to_route('route.name')`
- Inertia page render: `Inertia::render('admin/users/index', [...])` — lowercase kebab-case paths

### TypeScript / React
- Layouts resolved in `app.tsx` by page name prefix: `admin/*` → `[AppLayout, AdminLayout]`
- Forms use `<Form {...Controller.method.form(args)} ...>` pattern (Inertia + wayfinder)
- Shared Inertia props accessed via `usePage().props` — `auth.user`, `auth.roles`
- Route helpers come from `@/routes/...` (wayfinder-generated)
- Action helpers come from `@/actions/App/Http/Controllers/...` (wayfinder-generated)
- Types barrel-exported from `@/types/index.ts`

---

## Useful commands
```bash
# Dev servers
php artisan serve
pnpm dev

# After adding new routes (always use --with-form)
php artisan wayfinder:generate --with-form

# Reseed from scratch
php artisan migrate:fresh --seed

# Check admin routes
php artisan route:list --path=admin

# Add shadcn component (npx is blocked by PS execution policy, use this instead)
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" shadcn@latest add <component> --yes
```

---

## Planned next features
- Client portal: clients can browse and order products/services
- Admin dynamic form builder: customisable forms per product
- Staff-specific pages (TBD scope)
- Impersonation via lab404/laravel-impersonate (already in composer.json, deferred)
