# Docs to Types Reference

Use this only when `SKILL.md` needs concrete examples or scope boundaries.

## Allowed depth

Allowed:

- domain types, schemas/parsers, brands
- discriminated unions/state models
- smart constructors for validated values
- service/interface seams
- typed errors/results
- composition topology: modules, layers, factories, providers, registries, etc.
- memory/no-op adapters needed for typecheck or architecture tests
- production stubs that fail with typed `NotImplemented` errors
- architecture tests, lint rules, or import-boundary checks

Not allowed unless the user expands scope:

- feature/business behavior
- real persistence queries or network calls
- real HTTP handlers beyond contracts/boundaries
- after-the-fact broad refactors unrelated to codifying approved context
- speculative helper libraries or generic frameworks without concrete use cases

## Fact buckets

Look for facts in these categories:

1. **Language** — canonical terms and forbidden aliases.
2. **Shape** — variants, states, invariants, cardinality, allowed combinations, impossible states.
3. **Boundary** — which module owns which responsibility.
4. **Dependency** — which modules may import/call which others.
5. **Runtime** — services/interfaces, composition, config, time, absence/nullability, error policy.
6. **Adapter** — production/test adapters and external infrastructure boundaries.
7. **Call stack** — production and test paths through the system.
8. **Error** — expected failures and where they are translated.
9. **Edge** — where raw external input becomes validated domain data.
10. **Test surface** — public seams future behavior tests should target.

## Example: call stack

```txt
Production:
HTTP handlers
  -> LinkCatalog
    -> LinkCatalogDurableObjectAdapter
      -> Durable Object RPC/fetch boundary
        -> LinkCatalogCoordinator
          -> LinkCatalogStore
            -> LinkCatalogSqlExecutor
          -> PublicRedirectIndex

Tests:
HTTP handlers
  -> LinkCatalog
    -> LinkCatalogMemoryAdapter
      -> LinkCatalogCoordinator
        -> LinkCatalogStoreMemoryAdapter
        -> PublicRedirectIndexMemoryAdapter
```

## Example: prose to types

Prose:

```md
- Customer can order drip coffee or espresso-based coffee.
- Drip coffee is served with or without milk.
- Espresso can be one or two shots.
- Cappuccino and latte are espresso plus milk.
```

Types:

```ts
type Milk = "whole" | "oat" | "almond"
type Coffee = { beans: "arabica" | "robusta" }
type Espresso = { coffee: Coffee; shots: 1 | 2 }

type DripCoffee = { kind: "drip"; coffee: Coffee; milk?: Milk }
type StraightEspresso = { kind: "espresso"; espresso: Espresso }
type EspressoWithMilk = { kind: "cappuccino" | "latte"; espresso: Espresso; milk: Milk }

type Beverage = DripCoffee | StraightEspresso | EspressoWithMilk
```

If the type model needs awkward optional fields or permits impossible combinations, return to the ambiguity gate.

## Example: service seam

Use project conventions. Plain TypeScript shape:

```ts
export interface LinkCatalog {
  createAlias(input: CreateAliasInput): Promise<Result<AliasLink, LinkCatalogCreateError>>
  getLink(slug: LinkSlug): Promise<Result<Link | null, LinkCatalogReadError>>
}

export const createLinkCatalog = (deps: LinkCatalogDeps): LinkCatalog => ({
  createAlias: deps.coordinator.createAlias,
  getLink: deps.store.getLinkBySlug,
})
```

If the project uses DI, Context services, modules, providers, or layers, express the same seam that way.

## Example: edge type safety

Raw data from HTTP, queues, DBs, files, SDKs, and AI/model output is not domain data yet.

```ts
type EmailAddress = string & { readonly __brand: "EmailAddress" }
type InvalidEmailAddress = { kind: "InvalidEmailAddress"; input: string }

const createEmailAddress = (input: string): Result<EmailAddress, InvalidEmailAddress> =>
  input.includes("@") ? ok(input as EmailAddress) : err({ kind: "InvalidEmailAddress", input })
```

Use the project's actual schema/result/brand conventions.

## Example: dependency checks

Use the lightest existing mechanism: import-boundary lint, dependency-cruiser, custom rule, focused import-scan test, or documented rule in `AGENTS.md` if mechanical checking is too expensive.

Example facts to enforce:

- HTTP handlers may depend on `LinkCatalog`, not `LinkCatalogStore`.
- Domain modules may not import SQL/Cloud/SDK clients.
- Test adapters must satisfy the same seam as production adapters.
