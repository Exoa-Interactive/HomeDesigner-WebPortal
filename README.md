# HomeDesigner Web Portal

**Live demo:** https://homedesignerdemo.exoa.dev/

A web portal for browsing, previewing, and managing 3D home design projects. Built with **Laravel 12**, **Inertia.js**, and **React**, it lets users explore a gallery of design projects with interactive 3D model previews powered by Three.js.

## Features

- **Public gallery** — browse all design projects with cover images and filter by type (Templates / User Files)
- **3D model preview** — view GLB models directly in the browser via Three.js
- **Admin panel** — authenticated CRUD interface to create, edit, and delete projects
- **File management** — attach a GLB model, a JSON config file, and a cover image per project
- **Authentication** — login/register via Laravel Breeze (Sanctum-backed)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.2+, Laravel 12 |
| Frontend | React 18, Inertia.js v2, Tailwind CSS v3 |
| 3D rendering | Three.js |
| Database | SQLite (default) |
| Build tool | Vite 7 |

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+ and npm

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd HomeDesignerWebPortal

# 2. Install PHP dependencies
composer install

# 3. Set up the environment file
cp .env.example .env
php artisan key:generate

# 4. Create the SQLite database and run migrations
touch database/database.sqlite
php artisan migrate

# 5. Create the storage symlink (for public file access)
php artisan storage:link

# 6. Install JS dependencies
npm install
```

Alternatively, steps 2–6 can be run in one shot with:

```bash
composer setup
```

## Running Locally

The following command starts all four development processes concurrently (PHP server, queue worker, log viewer, and Vite):

```bash
composer dev
```

The app will be available at **http://localhost:8000**.

To build assets for production instead:

```bash
npm run build
php artisan serve
```

## Creating an Admin User

There is no seeded admin account. Create one via Tinker or the registration page, then use the `/admin` route once logged in:

```bash
php artisan tinker
> App\Models\User::create(['name'=>'Admin','email'=>'admin@example.com','password'=>bcrypt('password')]);
```

## Project Structure

```
app/Http/Controllers/ProjectController.php   — project CRUD logic
resources/js/Pages/Home.jsx                  — public gallery page
resources/js/Pages/Admin.jsx                 — admin management panel
resources/js/Components/ProjectPreviewModal  — Three.js 3D viewer modal
routes/web.php                               — application routes
database/migrations/                         — database schema
```

## Running Tests

```bash
composer test
```
