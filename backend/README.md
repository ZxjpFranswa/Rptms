# RPTMS API (Laravel 11 + MySQL)

Backend for [OG-frontend](../OG-frontend).

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure DB_* in .env, then:
php artisan migrate --seed
php artisan serve
```

API base URL: `http://localhost:8000/api`

Demo logins (password `demo`): `clerk`, `assessor`, `admin`

## Docker

```bash
docker compose up -d mysql
# Run composer install and migrate on host or in api container
```

## Tests

```bash
php artisan test
```
