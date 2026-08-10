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

- `users`, `password_reset_tokens`, `passkeys`, two-factor columns. `users` also carries
  `company` (free text) and `avatar_path` (profile photo).
- `user_invitations` — access links: hashed token, encrypted plaintext copy, nullable
  expiry, and the session the link created (see §5)
- `roles`, `permissions`, and their pivots (spatie/laravel-permission)
- `activity_log` — the tenant's own audit log
- `settings` — the tenant's branding/SEO (the `Setting::current()` singleton)
- `media_folders`, `media_files`
- `cache`, `cache_locks` — the tenant's own cache (see note below)

### Audit log

Both `activity_log` tables are written through spatie/laravel-activitylog. An
`Activity::saving` hook in `AppServiceProvider` stamps the requester's **IP and user
agent** onto every entry (security/audit purposes only — disclose it in your privacy
policy). Console runs (the scheduler, sync commands) have no requester and are left
unstamped rather than given a misleading synthetic `127.0.0.1`. The IP is surfaced as a
column on the tenant audit-log page, and `activitylog:clean` prunes entries past
`config/activitylog.php` → `delete_records_older_than_days` nightly at 03:00.

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
| `routes/web.php` | **Central** | Domain-constrained to the central host, behind `DiscourageSearchIndexing`. `/` → redirects to `superadmin.login`; requires `superadmin.php`. |
| `routes/superadmin.php` | **Central** | Super-admin console (guard `superadmin`). |
| `routes/tenant.php` | **Tenant** | Wrapped in `web`, `InitializeTenancyByDomain`, `PreventAccessFromCentralDomains`, `tenant.active`. Loads `settings.php`, `admin.php` + `storefront.php`. |
| `routes/settings.php`, `routes/admin.php` | **Tenant** | Profile/account settings and the admin panel — tenant-scoped. |

The whole central hostname is served with `X-Robots-Tag: noindex, nofollow`
(`DiscourageSearchIndexing`): the console is invite-only knowledge, and a header covers
every response so the login page needs no meta tag of its own.

### Public tenant routes worth knowing

```
GET   /invitations/{token}      invitations.accept        # confirmation page only
POST  /invitations/{token}      invitations.accept.store  # consumes the link (see §5)
GET   /onboarding/password      onboarding.password.edit  # auth, not verified
POST  /onboarding/password      onboarding.password.update
POST  /stop-impersonating       impersonate.leave         # reachable as the impersonated user
```

### Tenant user administration (`/admin/users`, per-action permissions)

```
GET   /admin/users                        users.view        admin.users.index
GET   /admin/users/create                 users.create      admin.users.create
POST  /admin/users                        users.create      admin.users.store
POST  /admin/users/invitations            users.create      admin.users.invitations.store
GET   /admin/users/{user}/edit            users.edit        admin.users.edit
PUT   /admin/users/{user}                 users.edit        admin.users.update
DEL   /admin/users/{user}                 users.delete      admin.users.destroy
POST  /admin/users/{user}/link            users.links       admin.users.link
DEL   /admin/users/{user}/link            users.links       admin.users.link.revoke
POST  /admin/users/{user}/reset-link      users.reset       admin.users.reset-link
POST  /admin/users/{user}/impersonate     users.impersonate admin.users.impersonate
```

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
GET   /superadmin/backups                       superadmin.backups.index
POST  /superadmin/backups/run                   superadmin.backups.run
GET   /superadmin/backups/{scope}/{path}/download  superadmin.backups.download
DEL   /superadmin/backups/{scope}/{path}        superadmin.backups.destroy
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
- `theme` — the active theme payload (tenant requests only).
- `suites` — the suites enabled for the tenant, gating suite-scoped navigation.
- `impersonating` — `{ name }` while an admin is viewing the app as another user, which
  drives the exit banner (`resources/js/components/impersonation-banner.tsx`).
- `notifications` — unread count + recent items for the bell.

### Super-admin account security

Super admins have a self-service settings area at `/superadmin/settings`
(`App\Http\Controllers\Superadmin\Settings\*`, pages under
`resources/js/pages/superadmin/settings/`):

- **Profile** — update name/email.
- **Password** — change password (current-password confirmation required).
- **Two-factor (TOTP)** — authenticator-app 2FA. Enable → scan QR + save recovery codes →
  confirm with a code. Once enabled, the login flow defers to a **challenge** step
  (`/superadmin/two-factor-challenge`) that accepts a TOTP code or a recovery code. Reuses
  Fortify's `TwoFactorAuthenticationProvider` + `TwoFactorAuthenticatable` trait, driven by
  the custom super-admin `LoginController` (`superadmin.2fa` session key holds the pending
  login between the password and challenge steps).
- **Passkeys (WebAuthn)** — add/remove passkeys, and a "Sign in with a passkey" button on
  the login page.

**Why super-admin passkeys are a parallel implementation.** `laravel/passkeys` is bound to
a single global model/guard/table (the tenant `web` guard + `users`). Super admins
therefore use their own `super_admin_passkeys` table and `App\Models\SuperAdminPasskey`,
with `SuperAdmin` implementing the `PasskeyUser` contract directly (not the package trait).
The controllers (`Superadmin\PasskeyController`, `Superadmin\PasskeyLoginController`) reuse
the package's cryptographic validators (`WebAuthn::attestationValidator()` /
`assertionValidator()`) and the browser-side `@laravel/passkeys` hooks — only the model
lookup and login are custom. The relying-party ID comes from `config('passkeys.relying_party_id')`
(derived from `APP_URL`), i.e. the central super-admin host.

> **Gotcha:** the passkey package registers a *global* `Route::bind('passkey', …)` that
> resolves to the tenant model. The super-admin passkey delete route therefore uses a
> `{superAdminPasskey}` route parameter to avoid that binding hijacking it.

Relevant migration: `database/migrations/2026_06_20_000005_add_security_to_super_admins.php`
(2FA columns on `super_admins` + the `super_admin_passkeys` table).

> **Note:** a WebAuthn ceremony can't be exercised headlessly (it needs a real
> authenticator), so passkey registration/login must be verified in a browser. The test
> suite covers everything else (options generation, auth, deletion, authorization) and the
> full 2FA enable → confirm → challenge → disable cycle.

---

## 5. User accounts & access links

Tenant user administration lives at `/admin/users`
(`app/Http/Controllers/Admin/{User,UserInvitation}Controller.php`,
`resources/js/pages/admin/users/*`). It is built for teams running **without a mail
server**: rather than emailing credentials, an admin mints a link and hands it over
through whatever channel they already use.

### Split `users.*` permissions

The original all-or-nothing `users.manage` is split per action, so staff can hold a
subset — typically viewing the roster and copying existing links, while minting,
resets, edits, deletes and impersonation stay admin-only.

| Permission | Grants |
|---|---|
| `users.view` | See the roster |
| `users.create` | Create accounts and invite users |
| `users.edit` | Edit an account |
| `users.delete` | Delete an account |
| `users.links` | Mint and revoke access links |
| `users.reset` | Issue password reset links |
| `users.impersonate` | View the app as another user |

`2026_08_18_000001_split_users_permission` creates the seven and grants **all** of them
to every role that held `users.manage`, then deletes the legacy permission — so
behaviour is unchanged until an admin unchecks boxes in the Roles editor. Its `down()`
reverses the split. `PermissionSeeder` seeds the same seven for new tenants, and
`LoginResponse` treats any of them as "this person belongs in the admin panel".

> **Route ordering matters.** In `routes/admin.php` the literal segments
> (`users/create`, `users/invitations`) are declared *before* the `{user}` routes, so
> they aren't swallowed as route parameters. The resource route was replaced by explicit
> per-action routes precisely so each could carry its own permission middleware.

### Access links (`UserInvitation`)

One link primitive covers both cases, decided at accept time from the target's state:

| Target state | Link behaves as | Default window |
|---|---|---|
| Not yet activated (`email_verified_at` null) | **Invitation** — signs in, then prompts for a password | 7 days |
| Activated | **Sign-in link** — signs straight in, no password | 24 hours |

The admin picks the window (24h / 7d / 30d / never). Lifecycle rules:

- **Reusable** until it expires or is revoked/superseded. Minting a new link for a user
  deletes the previous one (and kills the session it created).
- **First in wins.** While the session a link signed in is still alive, further uses are
  refused. It frees up on logout or once that session idles past `session.lifetime`.
  The browser holding the live session can always re-open its own link.
- **Two-step acceptance.** `GET /invitations/{token}` only renders a confirmation page;
  the sign-in happens on the `POST` behind its button. Prefetchers, antivirus scanners
  and chat unfurlers only ever `GET`, so they cannot consume a link.
- **Sessions live and die with their link.** Acceptance stamps the session with the
  invitation id and its bound session id; `EnsureLinkSessionIsValid` (registered in the
  `web` stack) logs the user out on the first request after the link expires, its row
  disappears, or the row points at a newer session. Enforcement is lazy, so no scheduler
  is needed. Password-born sessions carry no stamp and are never touched, and completing
  onboarding removes the stamp — the invite has converted into a credentialed account.

**Token storage.** The DB keeps a SHA-256 hash of the token for lookup, plus an
**encrypted-at-rest** copy of the plaintext (`plain_token`, `encrypted` cast) so an admin
can re-copy a live link from the roster after closing the mint dialog. A raw DB dump
alone therefore doesn't yield working links. Rows minted before that column existed have
no recoverable URL — re-mint to get one.

**Liveness detection** (`hasLiveSession()`, and the roster's `aliveSessionIds()`) reads
the session store directly, so it is only answerable on the **`database` session driver**.
On other drivers it degrades to the older replace-on-reuse behaviour rather than locking
a link forever on unverifiable state; `EnsureLinkSessionIsValid` stays authoritative
either way.

### Onboarding

A first-time acceptor lands on `/onboarding/password` (`OnboardingController`), guarded
by an `onboarding_user_id` session flag so it can't become a no-current-password reset
for existing accounts. Saving a password also retires the consumed invitation row and
clears the link-session stamp. These routes sit behind `auth` but **not** `verified`,
since acceptance is what verifies the email.

### Password reset links

`users.reset` issues a standard Laravel password-broker URL for an activated user and
flashes it for copying — the admin plays courier instead of a mail server. Single-use,
superseded by newer ones, and valid for **48 hours** (`config/auth.php` →
`passwords.users.expire`, raised from 60 minutes so the link survives the
copy-paste-and-forward round trip). Not-yet-activated users have no password to reset and
are pointed at invite links instead.

### Tenant impersonation

`TenantImpersonationController` stashes the admin's id in `impersonator_id` and swaps the
`web` session to the target. Same-domain with a return path, unlike the super admin's
cross-domain token dance (§6). Admins cannot impersonate other admins or themselves.
`stop-impersonating` lives outside the admin gate so the impersonated — possibly
non-admin — user can reach it. Both directions are written to the tenant activity log.

### Profile photos

`avatar_path` on `users`, uploaded via `ProfileController@updateAvatar` to the `public`
disk (tenant-scoped by `FilesystemTenancyBootstrapper`, so photos are isolated per
tenant). The `User::getAvatarAttribute()` accessor is appended to every serialization as
`avatar`, resolving to the tenant asset route or `null`; the UI falls back to initials.

---

## 6. Super-admin console

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

## 7. Plans & limits

- A tenant's plan is stored as `tenants.plan_id` → `plans`.
- `App\Support\TenantLimits::reachedUserLimit()` / `maxUsers()` read the current tenant's
  plan (`null` = unlimited, or central context = no limit).
- Enforced in **both** user-creation paths:
  - `Admin\UserController@store` (admin creates a user)
  - `Actions\Fortify\CreateNewUser` (public tenant registration)

---

## 8. Branding (tenancy-aware)

`Setting::branding()` provides app name, logo, favicon, primary color, and SEO defaults.
Because `settings` lives only in tenant DBs, both `HandleInertiaRequests` and the
`View::composer('app', …)` in `AppServiceProvider` only call it **when a tenant is
active** (`tenant()`), and fall back to config defaults on central requests. The primary
color is applied in `app.blade.php` (first paint) and live in `AppLayout`.

Each tenant's branding is naturally isolated because `settings` and the `settings.branding`
cache key live in the tenant's own database.

### Theme editor (tweakcn-style)

Tenant admins get a live theme editor at **Admin → Themes** (`admin/themes`, gated by
`settings.manage`). It edits the full shadcn CSS variable set (all keys in
`ThemeCss::KEYS`) for light **and** dark, plus radius and fonts, with instant preview;
themes are saved per-tenant, one can be active, and there's reset-to-default, presets, and
JSON import/export (tolerant of tweakcn exports).

- **Data**: `themes` table (tenant DB) → `App\Models\Theme`. `light`/`dark` are complete
  var maps; at most one `is_active`. `Theme::activePayload()` caches `{id, name, css,
  fontLinks}` (flushed on save/delete, and explicitly by the controller on the bulk
  activate/reset which bypass model events).
- **Compilation**: `App\Support\ThemeCss::compile()` is the single source of truth for the
  32-key whitelist and value sanitization. It builds the `:root {…}\n.dark {…}` block and
  **re-validates every value at read time** (`VALUE_PATTERN`) so a tampered DB row can't
  inject into the `<style>` tag. `fontLinks()` builds Bunny URLs for non-default families.
- **Injection**: mirrors branding — `app.blade.php` emits `<style id="app-theme">` (and
  Bunny font `<link>`s) after `@vite`; `HandleInertiaRequests`/the blade composer share the
  same payload; `resources/js/lib/apply-theme.ts` (used by `AppLayout`) manages that one
  `<style>` tag for live SPA updates. The active theme **supersedes** the legacy branding
  `primary_color` (which remains as a fallback when no theme is active).
- **Fonts**: served from **Bunny** (matching `vite.config.ts`), curated in
  `config/theme-fonts.php`. `Instrument Sans` is the sentinel default (no override / no
  extra link).
- **Editor internals** (`resources/js/lib/theme.ts`, `resources/js/pages/admin/settings/
  themes.tsx`, `resources/js/components/theme-editor/*`): live preview via a
  `<style id="theme-editor-preview">` tag re-appended on every edit (so it wins the
  cascade); swatches use a canvas-based `colorToHex` (`getComputedStyle` does not resolve
  `oklch`); import normalizes native / tweakcn-registry / tweakcn-internal shapes and wraps
  bare HSL triplets in `hsl(...)`.

> **Keep in sync:** the default var maps exist in three places — `resources/css/app.css`
> (source of truth), `resources/js/lib/theme.ts` (`DEFAULT_LIGHT`/`DEFAULT_DARK`), and
> `database/factories/ThemeFactory.php`. The key list lives in `ThemeCss::KEYS`.

> Contrast is the admin's responsibility (like tweakcn) — presets ship safe color pairs.

---

## 9. Backups

Everything here is **context-sensitive**: run inside an initialized tenant it dumps that
tenant's DB into the tenant-scoped disk; run centrally it dumps the central DB into
central storage. `App\Support\TenantBackups::inContext()` does the switching, and
`runHere()` backs up whatever `config('database.default')` currently points at (DB only)
before applying the retention policy.

### Per-tenant (tenant admin)

- `RunBackupJob` backs up the active database, so a tenant-admin-triggered backup dumps
  that tenant's DB. The `local` disk is already tenant-scoped, so archives land in the
  tenant's own storage directory.
- `php artisan tenants:backup` loops every tenant and backs each one up in its own context.

### Platform-wide (super admin)

`Superadmin\BackupController` + `resources/js/pages/superadmin/backups.tsx` render one
section per tenant plus the central database, each listing its archives newest-first with
a size, a date, and a health verdict (green while the newest dump is younger than 25h — a
daily schedule plus slack, so a slightly late run doesn't flap the badge).

- **Run now** for one tenant, the central DB, or everything.
- **Download** any archive; **delete** tenant archives. Central archives are
  download-only — retention prunes them.
- Archive paths travel through the URL **hex-encoded**, and are matched back against the
  destination's real listing rather than being used as filesystem input.
- **Restores stay out of this panel by design.** A tenant admin restores their own tenant;
  a central restore is a deliberate SSH operation.

`php artisan backup:all` is the same work as a command — central first (tiny, but it is
the map that makes tenant dumps restorable: tenants, domains, plans, super admins), then
every tenant. A failure is reported and never stops the rest. Scheduled nightly at 01:30
in `routes/console.php`; retention lives in `config/backup.php`.

> Notifications are disabled — there is no mailer. Health is surfaced on the super-admin
> Backups page instead.

> **Requires `mysqldump` on the PATH** (or `DB_DUMP_BINARY_PATH` set). This is an
> environment prerequisite — the same requirement existed before multi-tenancy.

---

## 10. Migrations & seeding

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

## 11. Default credentials (dev)

| Role | Email | Password | Where |
|---|---|---|---|
| Super admin | `super@example.com` | `super1234` | central domain (`localhost`) |
| Tenant admin | `admin@example.com` | `admin1234` | each tenant's domain |

Change these before any non-local use (they're set in the seeders).

---

## 12. Local development

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

## 13. Command cheat sheet

```bash
# Central
php artisan migrate:fresh --seed

# Tenants
php artisan tenants:migrate
php artisan tenants:migrate-fresh --seed
php artisan tenants:seed
php artisan tenants:backup
php artisan tenants:run "some:command"      # run any command in each tenant context

# Scheduled (see routes/console.php)
php artisan backup:all                      # every tenant DB + central   — 01:30
php artisan storefront:renew-subscriptions  #                             — 02:00
php artisan activitylog:clean               # prune audit entries         — 03:00

# Quality
php artisan test
vendor/bin/pint
npm run types:check
npm run lint:check
npm run format:check
npm run build
```

---

## 14. Testing

Because the schema is split across databases, the test suite uses a **single unified
schema** (`TestCase::unifiedMigrationPaths()`) that merges the central tables with the
non-colliding tenant tables. That list is built by **globbing** `database/migrations/
tenant/`, rejecting only the `cache_table` and `activity_log` migrations (the central
`activity_log`, with string morphs, is a superset of the tenant one) — so a newly added
tenant migration is picked up with no edit here.

`TestCase::refreshApplication()` also refuses to run unless the resolved connection is
in-memory SQLite. A stale `bootstrap/cache/config.php` overrides what `phpunit.xml` sets,
which can otherwise point `migrate:fresh` at a live dev database. If you hit that guard,
run `php artisan config:clear` (and never `config:cache`/`optimize` in local dev).

- **`TenantTestCase`** — runs each test inside an initialized tenant context on a tenant
  domain (`tenant.test`), with the DB-switch bootstrapper disabled so the unified schema
  serves as the tenant DB. Fast; exercises routing/auth/permissions/limits without
  provisioning a physical DB per test.
- **`CentralTestCase`** — super-admin tests on the central domain.

> **Rule:** any test using `RefreshDatabase` must extend `TenantTestCase` or
> `CentralTestCase` (not bare `TestCase`). `RefreshDatabase` migrates once per process and
> shares the schema across tests, so a bare test would migrate the central-only schema and
> break others depending on run order.

Current coverage: **122 tests** — the tenant-side suite (auth, dashboard, profile,
security), super-admin auth + tenant management, plan limits, super-admin account security
(profile, password, the full 2FA cycle, and the reachable passkey paths), and the theme
editor (permission gating, value sanitization, activation exclusivity, reset,
active-payload compilation, button-size emission, and compile-time tamper filtering).

User accounts and access links are covered by:

| Test | Covers |
|---|---|
| `Admin/AccessLinkTest` | Expiry presets and defaults, bogus presets, revocation, pruning of other users' expired links, and that a live link's URL is recoverable but encrypted at rest |
| `Admin/PasswordResetLinkTest` | Permission gating, token issuance, refusal for a not-yet-activated user |
| `Admin/UserCreateTest` | Company is required; a created account keeps it |
| `Admin/UserPermissionMatrixTest` | A `users.view`-only holder sees the roster (with copyable link URLs) and is refused every other action; no `users.view` means no roster |
| `Auth/InvitationAcceptTest` | The `GET` — including a declared prefetch — does not consume the token; the `POST` routes first-timers to onboarding and activated users into the app; reuse takes over the session; bogus tokens bounce |
| `Auth/LinkSessionTest` | The full link-session lifecycle: expiry, revocation, supersession, second-device refusal, freeing on idle/logout, the holder reopening their own link, onboarding lifting the leash, never-expiring links surviving |
| `Settings/AvatarTest` | Upload, replace (old file deleted), remove, non-image rejection |
| `Superadmin/BackupPageTest` | Auth requirement, one section per tenant plus central, central archives undeletable, scope validation, 404 on a missing archive, and that `backup:all` is scheduled |

---

## 15. Key files reference

| Concern | Path |
|---|---|
| Tenancy config | `config/tenancy.php` |
| Tenant lifecycle events | `app/Providers/TenancyServiceProvider.php` |
| Central models | `app/Models/{Tenant,Plan,SuperAdmin,SuperAdminPasskey}.php` |
| Tenant models | `app/Models/{User,UserInvitation,Setting,MediaFile,MediaFolder}.php` |
| User administration | `app/Http/Controllers/Admin/{User,UserInvitation}Controller.php`, `resources/js/pages/admin/users/*` |
| Access-link acceptance / onboarding | `app/Http/Controllers/{Invitation,Onboarding}Controller.php`, `resources/js/pages/auth/{invitation-accept,onboarding-password}.tsx` |
| Link-session enforcement | `app/Http/Middleware/EnsureLinkSessionIsValid.php` |
| Tenant impersonation | `app/Http/Controllers/TenantImpersonationController.php`, `resources/js/components/impersonation-banner.tsx` |
| Platform backups | `app/Support/TenantBackups.php`, `app/Http/Controllers/Superadmin/BackupController.php`, `app/Console/Commands/BackupAllCommand.php` |
| Central-domain noindex | `app/Http/Middleware/DiscourageSearchIndexing.php` |
| Super-admin controllers | `app/Http/Controllers/Superadmin/*` |
| Super-admin account settings | `app/Http/Controllers/Superadmin/Settings/*`, `resources/js/pages/superadmin/settings/*` |
| Super-admin 2FA / passkeys | `app/Http/Controllers/Superadmin/{TwoFactor,TwoFactorChallenge,Passkey,PasskeyLogin}*.php` |
| Suspended-tenant guard | `app/Http/Middleware/EnsureTenantIsActive.php` |
| Plan limits | `app/Support/TenantLimits.php` |
| Theme editor | `app/Support/ThemeCss.php`, `app/Models/Theme.php`, `app/Http/Controllers/Admin/ThemeController.php` |
| Theme editor (frontend) | `resources/js/lib/{theme,apply-theme}.ts`, `resources/js/pages/admin/settings/themes.tsx`, `resources/js/components/theme-editor/*` |
| Theme fonts catalog | `config/theme-fonts.php` |
| Shared Inertia props | `app/Http/Middleware/HandleInertiaRequests.php` |
| Exception mapping (404 / super-admin redirect) | `bootstrap/app.php` |
| Central seeders | `database/seeders/{DatabaseSeeder,PlanSeeder}.php` |
| Tenant seeder | `database/seeders/TenantDatabaseSeeder.php` |
| Super-admin UI | `resources/js/pages/superadmin/*`, `resources/js/layouts/superadmin/layout.tsx` |

---

## 16. Known gaps / future work

- **No public tenant self-signup.** Tenants are created only by the super admin. A guest
  on the central domain cannot create their own workspace yet. (Registration *within* an
  existing tenant works on that tenant's domain.) Adding self-serve onboarding would most
  naturally use an issued subdomain at signup, with custom domains verified/added later.
- **Custom-domain provisioning (DNS/TLS)** is manual/ops — no in-app domain verification.
- **Cross-tenant reporting** is per-request aggregation; move to a scheduled rollup if the
  tenant count grows.
- **Backups** require `mysqldump` on the host.
- **No mailer is assumed.** Invitations and password resets are delivered by the admin
  copying a link, not by email. Wiring a real mailer would let both be sent directly — the
  links themselves already work either way.
- **Access-link liveness needs the `database` session driver.** On other drivers the
  first-in-wins lock degrades to replace-on-reuse (§5); `EnsureLinkSessionIsValid` still
  enforces revocation and expiry.
- **`company` is free text** on `users`, deduplicated nowhere. Promoting it to a proper
  company entity (shared credits, per-company dashboards and branding) is the natural
  next step.
