# MCP Server Patterns

## Purpose
Build MCP (Model Context Protocol) servers using the Node/TypeScript SDK.

## Apply when
Implementing MCP servers, adding tools/resources/prompts, or configuring transport.

## Rules
- **Tools**: Register using `server.tool(...)`. Use Zod for strict input schema validation.
- **Resources**: Register read-only data streams using `server.resource(...)`. Handlers must process the requested `uri`.
- **Prompts**: Register reusable parameterized prompts for client use.
- **Transport**: Use `stdio` for local clients (Claude Desktop) and **Streamable HTTP** for remote clients (Cursor, cloud).
- **Idempotency**: Prefer idempotent tools so client retries are safe.

## Avoid
- Returning raw stack traces to the model; format errors clearly.
- Coupling tool logic tightly to the transport layer.
