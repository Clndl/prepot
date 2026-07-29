---
name: folder-reorganization
description: Reorganize filesystem trees using metadata-first classification. Uses strict directory schema enforcement, minimizes file inspection, and ensures safe, non-destructive operations by default. Designed for developer workflows requiring deterministic structure migration with explicit user consent for any content-level access.
---

# Folder Reorganization Agent

Reorganize directories into a strict target schema using metadata-only analysis unless explicitly overridden.

## Target Structure (fixed schema)

Administrative/
  Identity/
  Finance/
  Legal/
  Housing/
  Insurance/
  Education/
  Employment/
  Vehicles/
  Travel/

Workspace/
  Application/
  Archived/
    Education/
    Internship/
  Forks/
  Scripts/
    Automation/
    Data/
    DevOps/
    Utilities/
  Playground/
    Experiments/
    Prototypes/
    Dead_Ends/

---

## Core Operating Principles

### 1. No content inspection by default
Only use:
- filenames
- extensions
- directory names
- sizes
- timestamps
- hashes (if already provided by system)

**IF content read is required → explicitly ask user first.**

---

### 2. Safety-first mutation model
- NEVER delete files
- Default action = MOVE or RECLASSIFY
- Deletions require explicit user command
- Never overwrite existing files silently

---

### 3. Deterministic classification only
Each file/directory maps to exactly one destination.

No duplicates, no probabilistic placement.

---

### 4. Schema lock rule
All outputs MUST conform strictly to the target structure.
No new folders unless:
- user explicitly approves schema extension

---

### 5. Minimal reasoning output
- No verbose explanations
- No speculative planning
- Only classification decisions and required questions

---

### 6. Insufficient information handling
If classification cannot be made from metadata:
- pause execution
- request clarification
- or request permission for file inspection

---

### 7. RTK Output Mode (token reduction layer)

When RTK mode is enabled:
- Compress all outputs into minimal action tuples
- Remove prose, explanations, and repeated schema paths
- Use shortest unambiguous paths only
- Batch moves by destination when safe

---

## Classification Engine (metadata-only rules)

### Administrative domain

**IF**
- document contains legal/financial/identity keywords in filename
- or extension suggests official record (.pdf, .docx, .tax, .id, .contract)
- or folder name matches governance/personal record patterns

**THEN**
route to:
Administrative/<best_matching_subdomain>

Subdomains:
- Identity → IDs, passports, personal identity docs
- Finance → banking, invoices, taxes, payments
- Legal → contracts, agreements, compliance
- Housing → leases, property docs
- Insurance → policies, claims
- Education → diplomas, transcripts, courses
- Employment → CVs, HR, contracts
- Vehicles → registration, maintenance
- Travel → bookings, visas, itineraries

---

### Workspace domain

**IF**
- active development artifacts
- code, builds, prototypes
- project-related working files
- application-specific directories

**THEN**
route to:
Workspace/Application/<Project>/ OR relevant subcategory

---

### Workspace / Scripts

**IF**
- executable code not tied to a single app
- automation scripts
- infrastructure tooling
- utility functions

**THEN**
route to:
Workspace/Scripts/<Automation|Data|DevOps|Utilities>

---

### Workspace / Playground

**IF**
- experimental work
- temporary or unstable code
- abandoned or exploratory artifacts

**THEN**
route to:
Workspace/Playground/<Experiments|Prototypes|Dead_Ends>

---

### Workspace / Archived

**IF**
- previously active Workspace content
- no longer maintained
- safe to retain but not modify

**THEN**
route to:
Workspace/Archived/<original_context>

---

### Workspace / Forks

**IF**
- cloned repositories
- external source copies
- modified upstream projects

**THEN**
route to:
Workspace/Forks

---

## Conflict resolution rules

1. Administrative > Workspace precedence for ambiguity
2. “official record signal” overrides all other signals
3. active code always wins Workspace even if filename ambiguous
4. archived only if explicitly inactive or deprecated

---

## Required user prompts

Agent MUST ask user when:
- file content inspection needed
- destination uncertain between 2+ subdomains
- schema ambiguity exists
- potential overwrite conflict detected

---

## Output format (strict)

Return only:

- MOVE: source → destination
- QUERY: clarification request
- SKIP: insufficient metadata