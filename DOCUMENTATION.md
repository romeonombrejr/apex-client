# Application Documentation

A multi-tenant SaaS built on Laravel 13 + Inertia/React (TypeScript), using
**database-per-tenant** isolation via [`stancl/tenancy`](https://tenancyforlaravel.com).

---

## 1. Overview

There are **three actors** in this system:

| Actor | Lives in | Reached on | Auth guard |
|---|---|---|---|
| **Super admin** | Central database | Central domain (`localhost`) | `superadmin` |
| **Tenant admin** | A tenant's database | That tenant's domain | `web` (Fortify) |
| **Tenant user** | A tenant's database | That tenant's domain | `web` (Fortify) |

Each **tenant** gets its **own physical database** containing the full app schema
(users, roles/permissions, settings, media, activity log). A single **central
database** holds cross-tenant data (the tenant registry, plans, and super admins).

The **super admin** provisions and manages tenants; each **tenant admin** runs their
own isolated copy of the app.

---

## 2. Architecture

### Central vs Tenant databases

**Central database** (the default connection — `mysql`):

- `tenants`, `domains` — the tenant registry + domain→tenant mapping (stancl)
- `plans` — subscription plans and their limits
- `super_admins` — central super-admin accounts
- `activity_log` — audit log for super-admin actions (string morph IDs, because a
  subject may be a UUID `Tenant` while the causer is a bigint `SuperAdmin`)
- `tenant_user_impersonation_tokens` — short-lived impersonation tokens
- Framework tables kept central: `sessions`, `cache`, `cache_locks`, `jobs`,
  `job_batches`, `failed_jobs`

**Tenant database** (one per tenant, named `tenant<uuid>`):

- `users`, `password_reset_tokens`, `passkeys`, two-factor columns
- `roles`, `permissions`, and their pivots (spatie/laravel-permission)
- `activity_log` — the tenant's own audit log
- `settings` — the tenant's branding/SEO (the `Setting::current()` singleton)
- `media_folders`, `media_files`
- `cache`, `cache_locks` — the tenant's own cache (see note below)

### Tenancy bootstrappers (`config/tenancy.php`)

When a tenant request comes in, these make Laravel tenant-aware:

- **`DatabaseTenancyBootstrapper`** — swaps the default DB connection to the tenant's.
- **`FilesystemTenancyBootstrapper`** — roots the `local`/`public` disks under
  `storage/tenant<id>/…`, so uploaded logos/favicons/media are isolated automatically.
- **`QueueTenancyBootstrapper`** — makes queued jobs re-initialize their tenant.

> **`CacheTenancyBootstrapper` is intentionally NOT enabled.** It wraps every cache
> call in `->tags()`, which the `database` cache store doesn't support. Instead, each
> tenant database has its own `cache` table, so the connection swap gives natural
> per-tenant cache isolation.

### Connection pinning

Because the default connection is swapped to the tenant during a request, three things
are **pinned to the central connection** so they don't look for tables inside a tenant DB:

- **Sessions** — `config/session.php` → `connection` pinned to `DB_CONNECTION`.
- **Queue** — `config/queue.php` → `connections.database.connection` pinned to `DB_CONNECTION`.
- The **central models** (`Tenant`, `Plan`, `SuperAdmin`) use the
  `Stancl\Tenancy\Database\Concerns\CentralConnection` trait.

### Tenant identification: custom domains

Tenants are identified by **custom domain** (`InitializeTenancyByDomain`). Each request's
`Host` header is matched against the `domains` table. Central domains (in
`tenancy.central_domains`) skip tenant initialization. An unknown domain returns a clean
**404** (mapped from `TenantCouldNotBeIdentifiedException` in `bootstrap/app.php`).

---

## 3. Routing

| File | Scope | Notes |
|---|---|---|
| `routes/web.php` | **Central** | Domain-constrained to the central host. `/` → redirects to `superadmin.login`; requires `superadmin.php`. |
| `routes/superadmin.php` | **Central** | Super-admin console (guard `superadmin`). |
| `routes/tenant.php` | **Tenant** | Wrapped in `web`, `InitializeTenancyByDomain`, `PreventAccessFromCentralDomains`, `tenant.active`. Loads `settings.php` + `admin.php`. |
| `routes/settings.php`, `routes/admin.php` | **Tenant** | The existing app (profile, admin CRUD) — now tenant-scoped. |

**Tenant auth (Fortify)** — Fortify's routes (`/login`, `/register`, 2FA, passkeys) are
scoped to tenant domains via `config/fortify.php`'s middleware
(`InitializeTenancyByDomain` + `PreventAccessFromCentralDomains`). So `/login` **works on a
tenant domain** and **404s on the central domain**.

### Super-admin routes (`/superadmin/*`, central domain)

```
GET   /superadmin/login                         superadmin.login
POST  /superadmin/login                         superadmin.login.store
POST  /superadmin/logout                        superadmin.logout
GET   /superadmin/dashboard                     superadmin.dashboard
resource /superadmin/tenants (except show)      superadmin.tenants.*
POST  /superadmin/tenants/{tenant}/suspend      superadmin.tenants.suspend
POST  /superadmin/tenants/{tenant}/resume       superadmin.tenants.resume
POST  /superadmin/tenants/{tenant}/domains      superadmin.tenants.domains.store
DEL   /superadmin/tenants/{tenant}/domains/{d}  superadmin.tenants.domains.destroy
POST  /superadmin/tenants/{tenant}/impersonate  superadmin.tenants.impersonate
resource /superadmin/plans (index/store/update/destroy)  superadmin.plans.*
```

---

## 4. Authentication

- **Tenant users/admins** authenticate with the existing **Fortify** setup on the `web`
  guard, against the tenant database. Registration, password reset, email verification,
  2FA, and passkeys all work per-tenant.
- **Super admins** authenticate with a dedicated **`superadmin`** guard
  (`config/auth.php`), backed by the `super_admins` table and `App\Models\SuperAdmin`.
  Login lives at `/superadmin/login` (`App\Http\Controllers\Superadmin\LoginController`).
- Unauthenticated `/superadmin/*` requests redirect to `/superadmin/login` (handled in
  `bootstrap/app.php`, so they don't fall through to the tenant `/login`).

### Shared Inertia props (`HandleInertiaRequests`)

- `auth.user` / `auth.roles` / `auth.permissions` — the **tenant** user (explicit `web`
  guard, so the super admin isn't mistaken for a tenant user).
- `superAdmin` — the current super admin (or `null`).
- `branding` — tenant branding when a tenant is active, otherwise config defaults.

---

## 5. Super-admin console

`app/Http/Controllers/Superadmin/` + `resources/js/pages/superadmin/`.

### Tenant lifecycle (`TenantController`)

- **Provision** — creating a `Tenant` + `Domain` fires the stancl pipeline
  (`CreateDatabase` → `MigrateDatabase` → `SeedDatabase`), which builds the tenant DB,
  runs the tenant migrations, and seeds it (`TenantDatabaseSeeder`).
- **Suspend / Resume** — toggles `tenants.status`. The `EnsureTenantIsActive`
  (`tenant.active`) middleware returns **503** for suspended tenants.
- **Delete** — fires `DeleteDatabase`, dropping the tenant's database.
- **Domains** — add/remove domains for a tenant.

### Plans (`PlanController`)

CRUD for subscription plans (`name`, `slug`, `price`, `max_users`, `max_storage_mb`,
`is_active`). A plan with tenants attached cannot be deleted.

### Impersonation (`ImpersonationController`)

"Log in as admin" mints a short-lived stancl impersonation token, then uses
`Inertia::location` to send the browser to the tenant domain's `/impersonate/{token}`
route (`UserImpersonation::makeResponse`), which logs the super admin in as that tenant's
admin. Every impersonation is written to the central activity log.

### Cross-tenant reporting (`DashboardController`)

The super-admin dashboard aggregates usage across every tenant DB
(`$tenant->run(fn () => User::count())`), cached for 1 minute. Tenants that error are
logged and reported as `null` rather than silently dropped, so totals stay honest.
This is `O(number of tenants)` queries — fine for modest counts; move to a scheduled
aggregation job if the tenant count grows large.

---

## 6. Plans & limits

- A tenant's plan is stored as `tenants.plan_id` → `plans`.
- `App\Support\TenantLimits::reachedUserLimit()` / `maxUsers()` read the current tenant's
  plan (`null` = unlimited, or central context = no limit).
- Enforced in **both** user-creation paths:
  - `Admin\UserController@store` (admin creates a user)
  - `Actions\Fortify\CreateNewUser` (public tenant registration)

---

## 7. Branding (tenancy-aware)

`Setting::branding()` provides app name, logo, favicon, primary color, and SEO defaults.
Because `settings` lives only in tenant DBs, both `HandleInertiaRequests` and the
`View::composer('app', …)` in `AppServiceProvider` only call it **when a tenant is
active** (`tenant()`), and fall back to config defaults on central requests. The primary
color is applied in `app.blade.php` (first paint) and live in `AppLayout`.

Each tenant's branding is naturally isolated because `settings` and the `settings.branding`
cache key live in the tenant's own database.

---

## 8. Backups (per-tenant)

- `RunBackupJob` backs up **whichever database is currently active**
  (`config('database.default')`), so a tenant-admin-triggered backup dumps that tenant's
  DB. The `local` disk is already tenant-scoped, so backup files land in the tenant's
  storage directory.
- `php artisan tenants:backup` loops every tenant and backs each one up in its own context
  (for a scheduled central job).

> **Requires `mysqldump` on the PATH** (or `DB_DUMP_BINARY_PATH` set). This is an
> environment prerequisite — the same requirement existed before multi-tenancy.

---

## 9. Migrations & seeding

- **Central migrations**: `database/migrations/`
- **Tenant migrations**: `database/migrations/tenant/` (pointed to by
  `tenancy.migration_parameters`)

```bash
# Central database
php artisan migrate:fresh --seed        # seeds PlanSeeder + a super admin

# All tenant databases
php artisan tenants:migrate             # or: tenants:migrate-fresh --seed
php artisan tenants:seed                # runs TenantDatabaseSeeder per tenant
```

- **`DatabaseSeeder`** (central) → `PlanSeeder` + one super admin.
- **`TenantDatabaseSeeder`** (per tenant) → `RoleSeeder`, `PermissionSeeder`, a default
  tenant admin, and the settings row. Runs automatically when a tenant is provisioned.

---

## 10. Default credentials (dev)

| Role | Email | Password | Where |
|---|---|---|---|
| Super admin | `super@example.com` | `super1234` | central domain (`localhost`) |
| Tenant admin | `admin@example.com` | `admin1234` | each tenant's domain |

Change these before any non-local use (they're set in the seeders).

---

## 11. Local development

1. **Tenant domains don't auto-resolve on Windows.** Add hosts entries for any tenant
   domain you want to browse, e.g.:
   ```
   127.0.0.1  tenant1.localhost
   127.0.0.1  acme.localhost
   ```
   (`*.localhost` won't wildcard-resolve without this.)
2. **Central domain** = `localhost` (the super-admin console). `127.0.0.1` is also central.
3. Run: `php artisan serve`, `npm run dev` (or `npm run build`).
4. Provision a tenant from the super-admin console, or via tinker:
   ```php
   $t = App\Models\Tenant::create(['name' => 'Acme', 'plan_id' => 1]);
   $t->domains()->create(['domain' => 'acme.localhost']);
   ```

**Custom-domain TLS/DNS in production** is an operations concern (wildcard or per-domain
certificates, e.g. via Caddy/LetsEncrypt) — it's not handled in code.

---

## 12. Command cheat sheet

```bash
# Central
php artisan migrate:fresh --seed

# Tenants
php artisan tenants:migrate
php artisan tenants:migrate-fresh --seed
php artisan tenants:seed
php artisan tenants:backup
php artisan tenants:run "some:command"      # run any command in each tenant context

# Quality
php artisan test
vendor/bin/pint
npm run types:check
npm run build
```

---

## 13. Testing

Because the schema is split across databases, the test suite uses a **single unified
schema** (`TestCase::unifiedMigrationPaths()`) that merges the central tables with the
non-colliding tenant tables.

- **`TenantTestCase`** — runs each test inside an initialized tenant context on a tenant
  domain (`tenant.test`), with the DB-switch bootstrapper disabled so the unified schema
  serves as the tenant DB. Fast; exercises routing/auth/permissions/limits without
  provisioning a physical DB per test.
- **`CentralTestCase`** — super-admin tests on the central domain.

> **Rule:** any test using `RefreshDatabase` must extend `TenantTestCase` or
> `CentralTestCase` (not bare `TestCase`). `RefreshDatabase` migrates once per process and
> shares the schema across tests, so a bare test would migrate the central-only schema and
> break others depending on run order.

Current coverage: **51 tests** — the converted tenant-side suite (auth, dashboard,
profile, security), super-admin auth + tenant management, and plan limits.

---

## 14. Key files reference

| Concern | Path |
|---|---|
| Tenancy config | `config/tenancy.php` |
| Tenant lifecycle events | `app/Providers/TenancyServiceProvider.php` |
| Central models | `app/Models/{Tenant,Plan,SuperAdmin}.php` |
| Tenant models | `app/Models/{User,Setting,MediaFile,MediaFolder}.php` |
| Super-admin controllers | `app/Http/Controllers/Superadmin/*` |
| Suspended-tenant guard | `app/Http/Middleware/EnsureTenantIsActive.php` |
| Plan limits | `app/Support/TenantLimits.php` |
| Shared Inertia props | `app/Http/Middleware/HandleInertiaRequests.php` |
| Exception mapping (404 / super-admin redirect) | `bootstrap/app.php` |
| Central seeders | `database/seeders/{DatabaseSeeder,PlanSeeder}.php` |
| Tenant seeder | `database/seeders/TenantDatabaseSeeder.php` |
| Super-admin UI | `resources/js/pages/superadmin/*`, `resources/js/layouts/superadmin/layout.tsx` |

---

## 15. Known gaps / future work

- **No public tenant self-signup.** Tenants are created only by the super admin. A guest
  on the central domain cannot create their own workspace yet. (Registration *within* an
  existing tenant works on that tenant's domain.) Adding self-serve onboarding would most
  naturally use an issued subdomain at signup, with custom domains verified/added later.
- **Custom-domain provisioning (DNS/TLS)** is manual/ops — no in-app domain verification.
- **Cross-tenant reporting** is per-request aggregation; move to a scheduled rollup if the
  tenant count grows.
- **Backups** require `mysqldump` on the host.
