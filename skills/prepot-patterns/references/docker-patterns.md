# Docker Patterns

## Purpose
Enforce Docker and Compose best practices for dev/prod consistency, networking, and security.

## Apply when
Writing Dockerfiles, composing services, or debugging containers.

## Rules
- **Multi-stage Builds**: Separate `deps`, `dev`, `build`, and `production` stages.
- **Volumes**: Use named volumes for DB persistence, bind mounts for local code, and anonymous volumes to protect the container's `node_modules`.
- **Networks**: Use custom networks to isolate services (e.g., DB only reachable by API, not frontend).
- **Security**: Run as non-root user (`adduser`), drop capabilities (`cap_drop`), and use specific tags (never `:latest`).
- **Config**: Use `.env` files for local dev and Docker secrets for production.
- **Ignores**: Always use a `.dockerignore` to exclude `node_modules`, `.git`, and secrets.

## Avoid
- Using the `:latest` tag.
- Running containers as `root`.
- Hardcoding secrets in `Dockerfile` or `docker-compose.yml`.
- One giant container holding all services.
- Committing `.env` files to git.
