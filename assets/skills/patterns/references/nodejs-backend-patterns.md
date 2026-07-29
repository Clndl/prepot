# Node.js Backend Patterns

## Purpose
Enforce architecture patterns, API design, and database optimization for Node.js, Express, and Next.js APIs.

## Apply when
Designing REST/GraphQL APIs, implementing data access layers, or optimizing backend performance in JS/TS.

## Rules
- **API Design**: Use resource-based REST URLs and query parameters for filtering/pagination.
- **Architecture**: Separate business logic (Service Layer) from data access (Repository Pattern).
- **Database**: 
  - Select only needed columns.
  - Prevent N+1 queries by batch fetching (e.g., using Maps).
  - Use transactions for multi-insert operations.
- **Caching**: Use Redis or Cache-Aside for frequently accessed, slowly changing data.
- **Error Handling**: Use a centralized error handler. Throw custom `ApiError` instances.
- **Resilience**: Implement retries with exponential backoff for external API calls.
- **Auth**: Validate JWTs in middleware. Implement Role-Based Access Control (RBAC).
- **Rate Limiting**: Apply in-memory or Redis-based rate limiting per IP/user.
- **Background Jobs**: Use queues for non-blocking execution of heavy tasks.
- **Logging**: Use structured logging (JSON) with context (`requestId`, `userId`).

## Avoid
- `SELECT *` in database queries.
- N+1 query loops.
- Unhandled promise rejections (always use try/catch or centralized handler).
- Blocking the event loop with heavy synchronous tasks.
