---
name: create-feature-layer
description: Complete pipeline to implement a new domain entity from Model to Controller.
---

# Workflow: New Entity Implementation

## Contextual Prep
Before starting, read `.agent/skills/spring-architecture.md` and `.agent/skills/openapi-standards.md` to ensure all code complies with project-specific patterns.

## Implementation Steps
Follow these steps sequentially without interruption:

1. **Model:** Create the Entity (extending `BaseEntity<UUID>`) and the Repository (extending `BaseRepository`).
2. **Contract:** Create the 3 DTO records (Read/Create/Update).
3. **Mapping:** Generate the 3 MapStruct mappers and the `EntityMapperFacade`.
4. **Logic:** Create the Service inheriting from `BaseService`.
5. **Exposure:** Create the Controller inheriting from `CRUDController`.
6. **Documentation:** Apply Swagger annotations as per `openapi-standards.md`.

## Validation & Hooks (Mandatory)
Once the code is drafted, you MUST execute these safety checks:

1. **Inheritance Guard:** Run `.agent/hooks/inheritance-guard.sh <files>` to verify the base layer usage.
2. **DTO Sync:** Run `.agent/hooks/sync-dto-fields.sh <entity_path>` to ensure no fields were forgotten between Entity and DTOs.
3. **Schema Audit:** Run `.agent/hooks/pre-schema-change.sh <entity_path>` to review database impact.
4. **Build Check:** Run `mvn clean compile`. If MapStruct implementation fails to generate, fix the mappers and retry.

## Finalization
1. **Memory Update:** Update `.agent/memory.md` with the new entity name, its relationships, and any specific logic implemented.
2. **Verification:** Confirm to the user that the entity is ready and provide the Swagger URL for testing.