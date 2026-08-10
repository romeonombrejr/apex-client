# ApexClient

A **multi-tenant SaaS** built on Laravel 13 + Inertia/React (TypeScript). Each customer
(**tenant**) gets their own isolated database and admin panel; a central **super admin**
provisions and manages every tenant.

> **Deep dive:** this README is the quick start. For the full architecture — how
> tenancy, auth, user accounts and access links, provisioning, impersonation, plans,
> branding, and backups work — see **[DOCUMENTATION.md](DOCUMENTATION.md)**.

---

## Highlights

- **Database-per-tenant** isolation via [`stancl/tenancy`](https://tenancyforlaravel.com)
  — every tenant has its own database with the full app schema.
- **Custom-domain routing** — tenants are reached on their own domains.
- **Super-admin console** — provision / suspend / delete tenants, manage plans, impersonate
  a tenant admin, and view cross-tenant usage.
- **Per-tenant admin panel** — role & permission management, users, media library,
  activity log, backups, and branding/SEO settings.
- **User accounts control** — per-action `users.*` permissions, magic access links that
  sign people in without a mail server, admin-issued password reset links, tenant
  impersonation, and profile photos. See [User accounts](#user-accounts) below.
- **Live theme editor** — a tweakcn-style editor (colors, radius, button size, fonts,
  light & dark) with instant preview, saved themes, presets, and JSON import/export —
  per tenant.
- **Platform-wide backups** — a super-admin Backups page covering every tenant database
  plus the central one, with on-demand runs, downloads, health badges, and a nightly
  `backup:all` schedule.
- **Plans & limits** — assign plans with enforced limits (e.g. max users) per tenant.
- **Auth** — Laravel Fortify with registration, password reset, email verification,
  two-factor, and passkeys (per tenant); a separate guard for super admins, who also get
  account settings, TOTP two-factor, and passkey sign-in.
- **Audit trail** — every logged action records the requester's IP and user agent, pruned
  nightly by `activitylog:clean`.

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Laravel 13, PHP 8.3 |
| Multi-tenancy | stancl/tenancy (database-per-tenant) |
| Auth | Laravel Fortify (+ passkeys, 2FA) |
| RBAC | spatie/laravel-permission |
| Audit / Backups | spatie/laravel-activitylog, spatie/laravel-backup |
| Frontend | Inertia.js + React + TypeScript, Tailwind CSS |
| Database | MySQL 8 |

---

## Requirements

- PHP **8.3+** with the usual Laravel extensions
- **MySQL 8** (the DB user needs `CREATE DATABASE` — tenant databases are created at runtime)
- **Node.js** + npm
- **`mysqldump`** on the `PATH` (only needed for the backup feature)

---

## Getting started

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment
cp .env.example .env          # then set your DB_* credentials
php artisan key:generate

# 3. Central database (creates the tenant registry, plans, and a super admin)
php artisan migrate:fresh --seed

# 4. Build the frontend
npm run dev                   # or: npm run build

# 5. Serve
php artisan serve
```

### Create your first tenant

Log in to the super-admin console and create one, or use tinker:

```php
$tenant = App\Models\Tenant::create(['name' => 'Acme', 'plan_id' => 1]);
$tenant->domains()->create(['domain' => 'acme.localhost']);
```

This automatically creates the tenant's database, runs its migrations, and seeds a
tenant admin.

### Local domains (important)

Tenant domains don't auto-resolve locally. Add hosts entries for any tenant you want to
open in a browser:

```
127.0.0.1  acme.localhost
```

- **Central domain** (super-admin console): `http://localhost` → `/superadmin/login`
- **Tenant app**: `http://acme.localhost`

---

## Default credentials (dev)

| Role | URL | Email | Password |
|---|---|---|---|
| Super admin | `http://localhost/superadmin/login` | `super@example.com` | `super1234` |
| Tenant admin | `http://<tenant-domain>/login` | `admin@example.com` | `admin1234` |

**Change these before deploying** — they're defined in the seeders.

---

## User accounts

Admins manage tenant users at `/admin/users`. The panel is built for teams with **no mail
server**: instead of emailing credentials, an admin mints a link and hands it over.

### Access links

| Action | What it does |
|---|---|
| **Get invite link** | For a not-yet-activated account — signs them in and prompts them to set a password. |
| **Get sign-in link** | For an activated account — signs them straight in, no password needed. |
| **Copy** | Re-copies the account's live link from the roster. |
| **Revoke** | Kills the link, and any session it created, immediately. |
| **Reset link** | A standard single-use Laravel password-reset URL (valid 48h — see `config/auth.php`). |

Links are chosen with a validity window (24h / 7d / 30d / never) and behave as follows:

- **Reusable until revoked, superseded, or expired** — minting a new link replaces the old one.
- **First in wins** — while the session a link created is still alive, further uses are
  refused. It frees up on logout or once that session goes idle.
- **Sessions live and die with their link** — revoking or replacing a link signs its holder
  out (`EnsureLinkSessionIsValid`). Password-born sessions are never affected, and
  completing onboarding lifts the leash.
- Acceptance is two-step: the `GET` only shows a confirmation page, so prefetchers, link
  scanners and chat unfurlers can't consume a link.

Tokens are stored as a SHA-256 hash for lookup, plus an encrypted-at-rest copy of the
plaintext so an admin can re-copy an active link.

### Permissions

The old all-or-nothing `users.manage` is split per action, so staff can hold a subset:

| Permission | Grants |
|---|---|
| `users.view` | See the roster |
| `users.create` | Create accounts and invite users |
| `users.edit` | Edit an account |
| `users.delete` | Delete an account |
| `users.links` | Mint and revoke access links |
| `users.reset` | Issue password reset links |
| `users.impersonate` | View the app as another user |

The migration grants all seven to any role that previously held `users.manage`, so nothing
changes until an admin unchecks boxes in the Roles editor.

### Impersonation

`users.impersonate` lets an admin view the app as a tenant user, with a banner and an exit
button on every page. Admins cannot impersonate other admins or themselves. This is
same-domain and distinct from the super admin's cross-domain tenant impersonation.

---

## Common commands

```bash
# Migrations
php artisan migrate:fresh --seed        # central database
php artisan tenants:migrate             # all tenant databases
php artisan tenants:migrate-fresh --seed
php artisan tenants:seed
php artisan tenants:backup              # back up every tenant
php artisan tenants:run "some:command"  # run a command in each tenant context

# Backups
php artisan backup:all                  # every tenant DB + the central one (nightly at 01:30)
php artisan activitylog:clean           # prune audit entries past retention (nightly at 03:00)

# Quality
php artisan test                        # 122 tests
vendor/bin/pint                         # PHP formatting
npm run types:check                     # TypeScript
npm run lint:check                      # ESLint
npm run format:check                    # Prettier
npm run build
```

---

## Project layout

```
app/
  Http/Controllers/Admin/        # tenant admin panel (users, roles, media, backups…)
  Http/Controllers/Superadmin/   # super-admin console (tenants, plans, backups, impersonation)
  Http/Controllers/{Invitation,Onboarding,TenantImpersonation}Controller.php
                                 # magic-link acceptance, first-password setup, impersonation
  Http/Middleware/EnsureLinkSessionIsValid.php   # link-bound session enforcement
  Models/                        # Tenant, Plan, SuperAdmin (central) + User, Setting… (tenant)
  Support/TenantLimits.php       # plan-limit enforcement
  Support/TenantBackups.php      # context-aware (tenant / central) backup runner
config/tenancy.php               # tenancy configuration
database/migrations/             # central migrations
database/migrations/tenant/      # tenant migrations
routes/{web,superadmin,tenant,admin,settings}.php
resources/js/pages/superadmin/   # super-admin React pages
tests/{TenantTestCase,CentralTestCase}.php
DOCUMENTATION.md                 # full architecture reference
```

---

## Testing

```bash
php artisan test
```

The suite uses a unified test schema; any DB-backed test must extend `TenantTestCase`
(tenant-side) or `CentralTestCase` (super-admin) — see
[DOCUMENTATION.md §14](DOCUMENTATION.md#14-testing).

---

## License

MIT (Laravel starter kit basis). Update this section to match your project's license.
