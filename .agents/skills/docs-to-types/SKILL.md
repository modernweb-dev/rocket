---
name: docs-to-types
description: >-
  Converts grill-with-docs output — CONTEXT.md glossaries, ADRs, and approved domain decisions — into typed architecture. Use after grill-with-docs when the user wants domain types, seams, adapters, errors, call stacks, and dependency rules expressed in code before business behavior.
---

# Docs to Types

Upfront architecture skill for converting clarified prose into typed architecture. If the team knows a durable domain or architecture fact, the type system and module graph should know it too.

Not for general grilling, refactoring review, or the first TDD slice. `CONTEXT.md`, ADRs, and grill notes are source material, not the final harness.

## Prime directive

Do **not** implement business behavior. Compress approved context into the whole intended typed architecture:

- canonical domain types, schemas, brands, and invariants
- discriminated unions/state models that rule out invalid states
- smart constructors/parsers for values entering from system edges
- service/interface seams using project conventions
- typed result/error families and error translation boundaries
- production/test adapter slots
- composition/layer/module topology using project conventions
- production and test call stacks
- dependency-direction checks where practical

Do **not** create business workflows, real persistence/network logic, product behavior, after-the-fact refactors, generic mutation/outcome frameworks, or fake production logic pretending to be complete.

## Read first

1. `AGENTS.md` and project coding rules
2. `CONTEXT-MAP.md`, if present
3. relevant `CONTEXT.md` files
4. relevant `docs/adr/*`
5. approved `grill-with-docs` notes/specs
6. existing source near the target area

If there are no context docs/ADRs and no approved `grill-with-docs` output, stop and recommend `grill-with-docs`.

## Workflow

### 1. Extract architecture facts

Before editing, produce a fact table:

```md
| Fact                                        | Source     | Code artifact         | Confidence |
| ------------------------------------------- | ---------- | --------------------- | ---------- |
| Link Catalog is the application-facing seam | CONTEXT.md | `LinkCatalog` service | high       |
```

Include domain names, ownership boundaries, dependency direction, call stacks, adapter choices, runtime constraints, typed errors, and infrastructure that must stay behind adapters.

### 2. Ambiguity gate

If docs, code, or user plan conflict, ask one concrete question and wait.

If a prose fact cannot be represented cleanly as a type, seam, adapter, state, error, or dependency rule, treat the domain language as still ambiguous.

Example: `CONTEXT.md` says “Operator,” but code says “User” and “Actor.” Which is canonical?

### 3. Propose the typed structure

Before editing, unless the user requested direct implementation, list:

- files to create/update
- domain types/schemas/brands/invariants/smart constructors
- state models/discriminated unions
- service/interface seams
- typed result/error families
- production and test call stacks
- adapter slots/stubs
- architecture checks
- business logic intentionally excluded

Ask for approval.

### 4. Codify only the typed structure

When approved, write compiling architecture code for the full intended typed structure.

Rules:

- Use project domain names exactly.
- Prefer deep modules: small interfaces, complexity behind the seam.
- Follow project conventions for services, interfaces, DI, composition, layers, factories, providers, or registries.
- Model absence, validation, variants, states, and expected failures with project-native typed patterns.
- Keep HTTP/UI/CLI transport details at their boundaries.
- Keep storage, SQL, queues, RPC clients, SDKs, and third-party APIs behind adapters.
- Add architecture tests/lint/import rules when dependency direction can be checked mechanically.

See [REFERENCE.md](REFERENCE.md) for allowed code depth and examples.

### 5. Validate and report

Run narrow checks: typecheck, lint/static checks, and architecture tests if added. Final response: facts codified, files changed, production/test call stacks, adapter slots, checks run, and business logic left unimplemented.
