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

## Production Deployment (PHP-FPM + Nginx)

These steps assume a Linux server (Ubuntu/Debian) with PHP 8.2+, Composer, Node.js, and Nginx already installed, and the code deployed to `/var/www/HomeDesignerWebPortal`.

### 1. Install dependencies

```bash
cd /var/www/HomeDesignerWebPortal
composer install --no-dev --optimize-autoloader
npm install
npm run build
```

### 2. Configure the environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=sqlite
# or mysql/pgsql — set DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### 3. Database and storage

```bash
# If using SQLite
touch database/database.sqlite

php artisan migrate --force
php artisan storage:link
```

### 4. Set file permissions

The web server user (`www-data` on most distros) needs write access to `storage` and `bootstrap/cache`:

```bash
sudo chown -R www-data:www-data /var/www/HomeDesignerWebPortal
sudo find /var/www/HomeDesignerWebPortal/storage -type d -exec chmod 775 {} \;
sudo find /var/www/HomeDesignerWebPortal/bootstrap/cache -type d -exec chmod 775 {} \;
```

### 5. Cache config, routes, and views

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Re-run these three commands after every deploy or `.env` change.

### 6. Queue worker (Supervisor)

The app uses the `database` queue driver, so a persistent worker process is required. Create `/etc/supervisor/conf.d/homedesigner-worker.conf`:

```ini
[program:homedesigner-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/HomeDesignerWebPortal/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/HomeDesignerWebPortal/storage/logs/worker.log
stopwaitsecs=3600
```

Then reload Supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start homedesigner-worker:*
```

### 7. Nginx server block

Create `/etc/nginx/sites-available/homedesigner`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/HomeDesignerWebPortal/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/homedesigner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Adjust the `fastcgi_pass` socket path to match your installed PHP-FPM version (check with `php -v` and `ls /run/php/`).

### 8. HTTPS

Use [Certbot](https://certbot.eff.org/) to obtain and auto-renew a free TLS certificate for the Nginx server block:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 9. Deploying updates

```bash
git pull
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart homedesigner-worker:*
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
