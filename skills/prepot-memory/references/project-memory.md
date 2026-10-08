# Project Memory

Maintains the project's long-term knowledge to prevent architectural drift, domain inconsistency, duplicated decisions, and context loss.

**Core principle**: If knowledge matters for future implementation, it must exist in project memory. Undocumented decisions do not exist. Implicit conventions are dangerous.

## Memory Structure

### Small/Medium Projects (<20 features)

```
.ai/memory/
  decisions.md      # ADRs and key decisions (append-only)
  conventions.md    # Coding and naming conventions
  api-contracts.md  # API schemas and contracts
  changelog.md      # Feature history (append-only)
```

Do NOT create subdirectories until the project exceeds 20 implemented features.

### Large Projects (20+ features)

```
.ai/memory/
  architecture/    # System boundaries, topology, dependency/layering rules
  adr/             # Architecture Decision Records (ADR-NNN-name.md)
  domain/          # Entities, workflows, state transitions, invariants
  glossary/        # Canonical terminology, acronyms, forbidden terms
  api/             # Endpoint specs, schemas, validation, compatibility
  ux/              # Interaction standards, accessibility, responsive behavior
  security/        # Auth models, threats, data protection, compliance
  constraints/     # Forbidden libraries, performance budgets, deployment rules
  conventions/     # Coding style, folder structure, naming, testing, branching
  feature-history/ # Implemented features, modifications, deprecations, migrations
```

## When to Persist

Update memory when:
- Architecture, APIs, UX behavior, or conventions change
- A new dependency or pattern is introduced
- Technical debt is discovered or a refactor is completed
- A risk is identified or domain semantics evolve
- A feature is created, modified, deprecated, or rolled back

## ADR Management

Create ADRs for: architecture changes, infrastructure changes, auth strategy, API versioning, major dependency adoption, state management, database modeling, caching/sync strategies.

```yaml
id: / title: / status: / date:
context: / decision: / consequences: / alternatives_considered:
```

## Domain Consistency

- One canonical term per concept — no synonyms for core entities
- Normalize naming across frontend/backend/database
- Document explicitly (e.g. `User = authenticated actor`, `Customer = billing entity`)

## API Contract Preservation

Track: endpoint lifecycle, schema evolution, auth requirements, pagination, filtering, error contracts, idempotency. Before modifying an API: identify consumers, schema impacts, migration requirements.

## Refactor Safety

Before refactoring, evaluate: impacted features, architectural dependencies, API consumers, domain assumptions, shared utilities, historical constraints. Document: why it occurred, what problem existed, what constraints remain.

## Non-Negotiable Rules

Never:
- Leave major decisions undocumented
- Allow domain terminology drift
- Introduce undocumented conventions
- Modify APIs without memory updates
- Refactor without impact analysis
- Duplicate concepts across domains

Stop and document if you hear: "We'll remember this", "Temporary workaround", "This evolved organically", "This naming is inconsistent but acceptable".

## Output Formats

```yaml
# ADR
id: / title: / status: / date:
context: / decision: / consequences: / alternatives_considered:

# Domain Entity
entity:
  name: / description: / invariants: / relationships: / lifecycle:

# API Contract
endpoint:
  path: / method: / authentication:
  request_schema: / response_schema: / validation_rules: / compatibility_notes:

# UX Rule
ux_rule:
  id: / context: / expected_behavior:
  accessibility_requirements: / interaction_constraints:

# Convention
convention:
  category: / rule: / rationale: / examples:
```