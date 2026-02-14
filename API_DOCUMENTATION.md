# 3D Project Library - REST API Documentation

Base URL: `http://{host}/api`

All endpoints are **unauthenticated** (no API key or token required).
All responses use `Content-Type: application/json`.

---

## Data Model: Project

| Field         | Type              | Description                                      |
|---------------|-------------------|--------------------------------------------------|
| `id`          | `integer`         | Unique identifier                                |
| `name`        | `string`          | Display name of the project                      |
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
    "glb_url": "http://localhost:8000/storage/projects/glb/abc123.glb",
    "json_url": "http://localhost:8000/storage/projects/json/def456.json",
    "cover_image": "http://localhost:8000/storage/projects/covers/ghi789.png",
    "created_at": "2026-02-12T01:32:07.000000Z",
    "updated_at": "2026-02-12T01:32:07.000000Z"
}
```

---

## Endpoints

### 1. List All Projects

```
GET /api/projects
```

Returns an array of all projects, ordered by newest first.

**Response:** `200 OK`
```json
[
    { "id": 1, "name": "Warrior", "glb_url": "...", "json_url": "...", "cover_image": "...", "created_at": "...", "updated_at": "..." },
    { "id": 2, "name": "Mage", "glb_url": null, "json_url": "...", "cover_image": null, "created_at": "...", "updated_at": "..." }
]
```

Returns `[]` if no projects exist.

---

### 2. Get Single Project

```
GET /api/projects/{id}
```

**Path Parameters:**

| Parameter | Type      | Description          |
|-----------|-----------|----------------------|
| `id`      | `integer` | The project's ID     |

**Response:** `200 OK`
```json
{
    "id": 1,
    "name": "Warrior",
    "glb_url": "http://localhost:8000/storage/projects/glb/abc123.glb",
    "json_url": null,
    "cover_image": "http://localhost:8000/storage/projects/covers/ghi789.png",
    "created_at": "2026-02-12T01:32:07.000000Z",
    "updated_at": "2026-02-12T01:32:07.000000Z"
}
```

**Error:** `404 Not Found` if the project does not exist.

---

### 3. Create Project

```
POST /api/projects
```

**Content-Type:** `multipart/form-data`

**Body Parameters:**

| Parameter     | Type     | Required | Constraints              | Description                  |
|---------------|----------|----------|--------------------------|------------------------------|
| `name`        | `string` | Yes      | Max 255 characters       | Display name of the project  |
| `glb_file`    | `file`   | No       | Max 50 MB                | The `.glb` 3D model file     |
| `json_file`   | `file`   | No       | Max 10 MB                | The `.json` metadata file    |
| `cover_image` | `file`   | No       | Max 5 MB, must be image  | Cover image (jpg, png, etc.) |

**Response:** `201 Created`
```json
{
    "id": 3,
    "name": "Archer",
    "glb_url": "http://localhost:8000/storage/projects/glb/uniqueid.glb",
    "json_url": null,
    "cover_image": "http://localhost:8000/storage/projects/covers/uniqueid.png",
    "created_at": "2026-02-12T02:00:00.000000Z",
    "updated_at": "2026-02-12T02:00:00.000000Z"
}
```

**Error:** `422 Unprocessable Entity` on validation failure:
```json
{
    "message": "The name field is required.",
    "errors": {
        "name": ["The name field is required."]
    }
}
```

---

### 4. Update Project

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

| Parameter     | Type     | Required | Constraints              | Description                              |
|---------------|----------|----------|--------------------------|------------------------------------------|
| `name`        | `string` | No       | Max 255 characters       | New display name (omit to keep current)  |
| `glb_file`    | `file`   | No       | Max 50 MB                | New `.glb` file (omit to keep current)   |
| `json_file`   | `file`   | No       | Max 10 MB                | New `.json` file (omit to keep current)  |
| `cover_image` | `file`   | No       | Max 5 MB, must be image  | New cover image (omit to keep current)   |

Only include the fields you want to change. Omitted fields retain their current values. Uploading a new file replaces the old one (the old file is deleted from storage).

**Response:** `200 OK` - Returns the updated project object.

**Error:** `404 Not Found` if the project does not exist.

---

### 5. Delete Project

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

```
GET http://localhost:8000/storage/projects/glb/abc123.glb
GET http://localhost:8000/storage/projects/json/def456.json
GET http://localhost:8000/storage/projects/covers/ghi789.png
```

---

## Error Responses

All errors follow this format:

| Status | Meaning                    |
|--------|----------------------------|
| `404`  | Project not found          |
| `422`  | Validation error (see `errors` object in response body) |
| `500`  | Server error               |

404 response body:
```json
{
    "message": "No query results for model [App\\Models\\Project] 999."
}
```

---

## curl Examples

```bash
# List all
curl http://localhost:8000/api/projects

# Get one
curl http://localhost:8000/api/projects/1

# Create (name only)
curl -X POST http://localhost:8000/api/projects \
  -H "Accept: application/json" \
  -F "name=Warrior"

# Create (with files)
curl -X POST http://localhost:8000/api/projects \
  -H "Accept: application/json" \
  -F "name=Warrior" \
  -F "glb_file=@/path/to/model.glb" \
  -F "json_file=@/path/to/meta.json" \
  -F "cover_image=@/path/to/cover.png"

# Update name only
curl -X POST http://localhost:8000/api/projects/1 \
  -H "Accept: application/json" \
  -F "name=Updated Name"

# Update with new GLB file
curl -X POST http://localhost:8000/api/projects/1 \
  -H "Accept: application/json" \
  -F "glb_file=@/path/to/new_model.glb"

# Delete
curl -X DELETE http://localhost:8000/api/projects/1 \
  -H "Accept: application/json"
```
