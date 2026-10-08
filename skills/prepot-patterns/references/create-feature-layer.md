# Workflow: New Entity Implementation

## Contextual Prep
Before starting, read [springboot-patterns.md](springboot-patterns.md) and [api-design-patterns.md](api-design-patterns.md) to ensure all code complies with project-specific patterns.

## Implementation Steps
Follow these steps sequentially without interruption:

1. **Model:** Create the Entity (extending `BaseEntity<UUID>`) and the Repository (extending `BaseRepository`).
2. **Contract:** Create the 3 DTO records (Read/Create/Update).
3. **Mapping:** Generate the 3 MapStruct mappers and the `EntityMapperFacade`.
4. **Logic:** Create the Service inheriting from `BaseService`.
5. **Exposure:** Create the Controller inheriting from `CRUDController`.
6. **Documentation:** Apply Swagger annotations as per [api-design-patterns.md](api-design-patterns.md).

## Validation (Mandatory)
Once the code is drafted, you MUST execute this safety check:

1. **Build Check:** Run `mvn clean compile`. If MapStruct implementation fails to generate, fix the mappers and retry.

## Finalization
1. **Memory Update:** Update project memory (`prepot-memory` skill) with the new entity name, its relationships, and any specific logic implemented.
2. **Verification:** Confirm to the user that the entity is ready and provide the Swagger URL for testing.