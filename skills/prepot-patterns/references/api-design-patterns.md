# API Design Patterns

## Purpose
Enforce REST API design patterns, status codes, pagination, and versioning.

## Apply when
Designing REST APIs or reviewing API contracts.

## Rules
- **URLs**: Plural nouns, kebab-case, no verbs (e.g., `/api/v1/users`).
- **Methods**: `GET` (read), `POST` (create), `PUT` (replace), `PATCH` (update), `DELETE` (remove).
- **Status Codes**: 
  - `200` OK, `201` Created, `204` No Content.
  - `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `422` Unprocessable Entity, `429` Too Many Requests.
  - `500` Internal Server Error.
- **Pagination**: Use offset pagination for simple/small lists, cursor-based for infinite scroll or large datasets.
- **Auth**: Use Bearer tokens or API keys. Enforce Role-Based Access Control (RBAC).
- **Versioning**: Use URL path versioning (`/api/v1/`).
- **Envelope**: Use a consistent response envelope (`{"data": {}, "meta": {}, "error": {}}`).

## Avoid
- Returning `200 OK` with an error payload.
- Leaking stack traces or internal DB errors.
- Verbs in URLs (e.g., `/getUsers`).
- Returning `500` for client validation errors (use `400` or `422`).
