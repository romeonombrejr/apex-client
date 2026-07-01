# HelloClient

A **multi-tenant SaaS** built on Laravel 13 + Inertia/React (TypeScript). Each customer
(**tenant**) gets their own isolated database and admin panel; a central **super admin**
provisions and manages every tenant.

> **Deep dive:** this README is the quick start. For the full architecture — how
> tenancy, auth, provisioning, impersonation, plans, branding, and backups work — see
> **[DOCUMENTATION.md](DOCUMENTATION.md)**.

---

## Highlights

- **Database-per-tenant** isolation via [`stancl/tenancy`](https://tenancyforlaravel.com)
  — every tenant has its own database with the full app schema.
- **Custom-domain routing** — tenants are reached on their own domains.
- **Super-admin console** — provision / suspend / delete tenants, manage plans, impersonate
  a tenant admin, and view cross-tenant usage.
- **Per-tenant admin panel** — role & permission management, users, media library,
  activity log, backups, and branding/SEO settings.
- **Plans & limits** — assign plans with enforced limits (e.g. max users) per tenant.
- **Auth** — Laravel Fortify with registration, password reset, email verification,
  two-factor, and passkeys (per tenant); a separate guard for super admins, who also get
  account settings, TOTP two-factor, and passkey sign-in.

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

## Common commands

```bash
# Migrations
php artisan migrate:fresh --seed        # central database
php artisan tenants:migrate             # all tenant databases
php artisan tenants:migrate-fresh --seed
php artisan tenants:seed
php artisan tenants:backup              # back up every tenant
php artisan tenants:run "some:command"  # run a command in each tenant context

# Quality
php artisan test                        # 62 tests
vendor/bin/pint                         # PHP formatting
npm run types:check                     # TypeScript
npm run build
```

---

## Project layout

```
app/
  Http/Controllers/Admin/        # tenant admin panel (users, roles, media, backups…)
  Http/Controllers/Superadmin/   # super-admin console (tenants, plans, impersonation)
  Models/                        # Tenant, Plan, SuperAdmin (central) + User, Setting… (tenant)
  Support/TenantLimits.php       # plan-limit enforcement
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
[DOCUMENTATION.md §13](DOCUMENTATION.md#13-testing).

---

## License

MIT (Laravel starter kit basis). Update this section to match your project's license.
