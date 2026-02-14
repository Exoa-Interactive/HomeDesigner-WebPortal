# Home Designer - REST API Documentation

Base URL: `http://{host}/api`

All responses use `Content-Type: application/json`.

---

## Authentication

The API uses **Laravel Sanctum** token-based authentication. Some endpoints are public; others require a valid bearer token.

To authenticate, call `POST /api/login` to receive a token. Include it in subsequent requests via the `Authorization` header:

```
Authorization: Bearer {token}
```

---

## Data Model: Project

| Field         | Type              | Description                                      |
|---------------|-------------------|--------------------------------------------------|
| `id`          | `integer`         | Unique identifier                                |
| `name`        | `string`          | Display name of the project                      |
| `type`        | `string`          | Either `template` or `userfile`                  |
| `user_id`     | `integer \| null` | ID of the owning user, or `null`                 |
| `glb_url`     | `string \| null`  | Full URL to the `.glb` 3D model file, or `null`  |
| `json_url`    | `string \| null`  | Full URL to the `.json` metadata file, or `null` |
| `cover_image` | `string \| null`  | Full URL to the cover image file, or `null`      |
| `created_at`  | `string`          | ISO 8601 datetime (e.g. `2026-02-12T01:32:07.000000Z`) |
| `updated_at`  | `string`          | ISO 8601 datetime                                |

Example object:
```json
{
    "id": 1,
    "name": "Warrior",
    "type": "template",
    "user_id": 1,
    "glb_url": "http://localhost:8000/storage/projects/1/1.glb",
    "json_url": "http://localhost:8000/storage/projects/1/1.json",
    "cover_image": "http://localhost:8000/storage/projects/1/1.png",
    "created_at": "2026-02-12T01:32:07.000000Z",
    "updated_at": "2026-02-12T01:32:07.000000Z"
}
```

---

## Auth Endpoints

### Login

```
POST /api/login
```

**Content-Type:** `application/json`

**Body:**

| Parameter  | Type     | Required | Description        |
|------------|----------|----------|--------------------|
| `email`    | `string` | Yes      | User email address |
| `password` | `string` | Yes      | User password      |

**Response:** `200 OK`
```json
{
    "user": { "id": 1, "name": "Admin", "email": "admin@demo.com", ... },
    "token": "1|abc123..."
}
```

**Error:** `401 Unauthorized`
```json
{
    "message": "Invalid credentials."
}
```

---

### Logout

```
POST /api/logout
```

**Requires:** `Authorization: Bearer {token}`

Revokes the current access token.

**Response:** `200 OK`
```json
{
    "message": "Logged out."
}
```

---

### Get Current User

```
GET /api/user
```

**Requires:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Admin",
    "email": "admin@demo.com",
    "email_verified_at": null,
    "created_at": "...",
    "updated_at": "..."
}
```

---

## Project Endpoints

### 1. List All Projects (Public)

```
GET /api/projects
```

Returns an array of all projects, ordered by newest first.

**Response:** `200 OK`
```json
[
    { "id": 1, "name": "Warrior", "type": "template", "user_id": 1, "glb_url": "...", "json_url": "...", "cover_image": "...", "created_at": "...", "updated_at": "..." }
]
```

Returns `[]` if no projects exist.

---

### 2. Get Single Project (Public)

```
GET /api/projects/{id}
```

**Path Parameters:**

| Parameter | Type      | Description          |
|-----------|-----------|----------------------|
| `id`      | `integer` | The project's ID     |

**Response:** `200 OK` - Returns the project object.

**Error:** `404 Not Found` if the project does not exist.

---

### 3. My Projects (Authenticated)

```
GET /api/my-projects
```

**Requires:** `Authorization: Bearer {token}`

Returns only projects belonging to the authenticated user (`user_id` matches).

**Response:** `200 OK`
```json
[
    { "id": 2, "name": "My Design", "type": "userfile", "user_id": 1, ... }
]
```

---

### 4. Create Project (Public)

```
POST /api/projects
```

**Content-Type:** `multipart/form-data`

**Body Parameters:**

| Parameter     | Type     | Required | Constraints                         | Description                  |
|---------------|----------|----------|-------------------------------------|------------------------------|
| `name`        | `string` | Yes      | Max 255 characters                  | Display name of the project  |
| `type`        | `string` | Yes      | Must be `template` or `userfile`    | Project type                 |
| `user_id`     | `integer`| No       | Must exist in users table           | Owning user ID               |
| `glb_file`    | `file`   | No       | Max 50 MB                           | The `.glb` 3D model file     |
| `json_file`   | `file`   | No       | Max 10 MB                           | The `.json` metadata file    |
| `cover_image` | `file`   | No       | Max 5 MB, must be image             | Cover image (jpg, png, etc.) |

**Response:** `201 Created` - Returns the created project object.

**Error:** `422 Unprocessable Entity` on validation failure.

---

### 5. Update Project (Public)

```
POST /api/projects/{id}
```

Uses `POST` (not `PUT`/`PATCH`) because `multipart/form-data` file uploads are not reliably supported with PUT/PATCH in all HTTP clients.

**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Parameter | Type      | Description      |
|-----------|-----------|------------------|
| `id`      | `integer` | The project's ID |

**Body Parameters:**

| Parameter     | Type     | Required | Constraints                         | Description                              |
|---------------|----------|----------|-------------------------------------|------------------------------------------|
| `name`        | `string` | No       | Max 255 characters                  | New display name (omit to keep current)  |
| `type`        | `string` | No       | Must be `template` or `userfile`    | New type (omit to keep current)          |
| `user_id`     | `integer`| No       | Must exist in users table           | New owning user ID                       |
| `glb_file`    | `file`   | No       | Max 50 MB                           | New `.glb` file (replaces old)           |
| `json_file`   | `file`   | No       | Max 10 MB                           | New `.json` file (replaces old)          |
| `cover_image` | `file`   | No       | Max 5 MB, must be image             | New cover image (replaces old)           |

**Response:** `200 OK` - Returns the updated project object.

**Error:** `404 Not Found` if the project does not exist.

---

### 6. Delete Project (Public)

```
DELETE /api/projects/{id}
```

**Path Parameters:**

| Parameter | Type      | Description      |
|-----------|-----------|------------------|
| `id`      | `integer` | The project's ID |

**Response:** `200 OK`
```json
{
    "message": "Project deleted."
}
```

**Error:** `404 Not Found` if the project does not exist.

---

## File Download

The URLs returned in `glb_url`, `json_url`, and `cover_image` are direct download links. You can fetch them with a simple `GET` request (no headers required).

---

## Error Responses

| Status | Meaning                    |
|--------|----------------------------|
| `401`  | Unauthenticated (missing or invalid token) |
| `404`  | Project not found          |
| `422`  | Validation error (see `errors` object in response body) |
| `500`  | Server error               |

---

## curl Examples

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@demo.com","password":"password"}'

# Get current user (authenticated)
curl http://localhost:8000/api/user \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# My projects (authenticated)
curl http://localhost:8000/api/my-projects \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Logout (authenticated)
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# List all projects (public)
curl http://localhost:8000/api/projects

# Get one project (public)
curl http://localhost:8000/api/projects/1

# Create (name only)
curl -X POST http://localhost:8000/api/projects \
  -H "Accept: application/json" \
  -F "name=Warrior" \
  -F "type=template"

# Create (with files)
curl -X POST http://localhost:8000/api/projects \
  -H "Accept: application/json" \
  -F "name=Warrior" \
  -F "type=template" \
  -F "user_id=1" \
  -F "glb_file=@/path/to/model.glb" \
  -F "json_file=@/path/to/meta.json" \
  -F "cover_image=@/path/to/cover.png"

# Update name only
curl -X POST http://localhost:8000/api/projects/1 \
  -H "Accept: application/json" \
  -F "name=Updated Name"

# Delete
curl -X DELETE http://localhost:8000/api/projects/1 \
  -H "Accept: application/json"
```
