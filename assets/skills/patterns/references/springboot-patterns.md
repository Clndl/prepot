# Spring Boot Patterns

## Purpose
Enforce layered Spring Boot architecture, REST API design, and data access standards.

## Apply when
Building Java Spring Boot backend services, controllers, and repositories.

## Rules
- **Architecture**: Enforce Layered Abstraction (`CRUDController` -> `BaseService` -> `BaseRepository` -> `BaseEntity<UUID>`).
- **Data Access**: All entities must use `@GeneratedValue(strategy = GenerationType.UUID)`.
- **Boilerplate**: Use Lombok (`@Getter`, `@Builder`, etc). MapStruct is required for Read/Create/Update DTO mapping + Facades.
- **Documentation**: Javadoc is required on all public methods. Swagger (`@Operation`, `@ApiResponse`, `@Parameter`, `@Tag`) is required on all controllers.
- **Transactions**: Use `@Transactional` on service methods (add `readOnly = true` for read-only queries).
- **Error Handling**: Use `@ControllerAdvice` for global handling. Return structured errors (`ApiError` or RFC 7807 problem details).
- **Validation**: Use `@Valid` and Bean Validation annotations (`@NotBlank`, `@NotNull`, `@Size`) on Request DTOs.
- **Async & Cache**: Use `@EnableAsync`/`@Async` for background tasks and `@Cacheable`/`@CacheEvict` for expensive lookups.
- **Rate Limiting/Security**: Never trust `X-Forwarded-For` blindly; configure `ForwardedHeaderFilter` properly to reliably use `request.getRemoteAddr()`.

## Avoid
- Field injection (`@Autowired` fields) — use constructor injection.
- Exposing raw Exceptions or Stack Traces to the client.
- Writing manual getter/setter boilerplate (use Lombok).
