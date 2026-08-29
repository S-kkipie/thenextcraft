# thenextcraft — conventions (rules)

Project-specific rules a contributor (human or agent) enforces on `thenextcraft`.
Adapted from `hackaton-starter/docs/code-review`, ported to our stack: **Turborepo
monorepo · Next 16 (App Router) · Convex · shadcn/ui · zod**.

Stack note: Convex **replaces** the Elysia + Drizzle + Postgres + Eden + TanStack-Query
layers of the starter. There are no REST routes, no ORM, no manual query cache —
you write Convex `query`/`mutation`/`action` functions and read them with Convex's
reactive hooks.

## Where code goes

```
apps/web/
  app/(app)/<route>/page.tsx     RSC route → renders a feature's UI
  features/<domain>/
    schema.ts                    zod schemas + z.infer types (single source of truth)
    hooks.ts                     thin wrappers over Convex useQuery/useMutation
    components/                  UI (lists, cards, detail)
    forms/                       react-hook-form + zodResolver + shadcn <Form>
  components/ui/                  shadcn primitives (shared, generated)
  lib/                           utils, shared client helpers
packages/backend/convex/
  schema.ts                      ALL tables (one file)
  <domain>.ts                    query / mutation / action; args validated with `v`
  auth.ts  http.ts               auth + webhooks (httpAction)
```

Web imports the backend via the generated api: `import { api } from "@thenextcraft/backend/api"`.

---

## 1. Zod is the single type source `MAJOR`

Define a zod schema for every data shape and derive the TypeScript type — never
hand-write a mirror type.

```ts
// features/challenge/schema.ts
export const challengeInput = z.object({
  title: z.string().min(3),
  businessProblem: z.string().min(20),
  successCriteria: z.array(z.string().min(1)).min(1),
  reward: z.string().optional(),
});
export type ChallengeInput = z.infer<typeof challengeInput>;
```

**Check:** a new `type`/`interface` duplicating a schema's fields is a violation —
derive it with `z.infer<typeof schema>` or `(typeof CONST)[number]`.

## 2. Never re-export types `MAJOR`

A type is imported from the one module that defines it — never re-exported from a
module that did not define it. No convenience re-export to give a type a second
import path.

```ts
// ❌ hooks.ts re-exporting a schema's type so callers can import it from here
export type { ChallengeInput };
// ✅ every consumer imports from the defining module
import type { ChallengeInput } from "@/features/challenge/schema";
```

A module's own public-API barrel (`index.ts` re-exporting its *own* sibling files)
is fine. The rule targets re-exporting a type you did **not** define.

## 3. Validation happens at the boundary `MAJOR`

- **User input (forms, params):** validated with a **zod** schema — the same schema
  whose `z.infer` types the form values. No unvalidated user input.
- **Convex function args:** validated with Convex `v` validators (`convex/values`) —
  Convex requires its own validator on every `args`. Keep the `v` args mirroring the
  zod schema (same fields, same optionality). Never accept an unvalidated `args`.

```ts
// convex/challenges.ts
export const create = mutation({
  args: { title: v.string(), businessProblem: v.string(),
          successCriteria: v.array(v.string()), reward: v.optional(v.string()) },
  handler: async (ctx, args) => { /* ... */ },
});
```

**Check:** external input is zod-validated at the form/route boundary; every Convex
function declares `args` with `v` validators mirroring the zod shape.

## 4. Data fetching = Convex reactive hooks `MAJOR`

Read data with `useQuery(api.<domain>.<fn>, args)` and write with
`useMutation(api.<domain>.<fn>)` from `convex/react`. The generated `api` is the
single source. Convex queries are **already reactive** — do NOT wrap them in
TanStack Query, do NOT hand-roll `fetch`/`queryKey`/`queryFn`, do NOT build REST
routes. Skip an argument with `"skip"` when it isn't ready:
`useQuery(api.challenges.get, id ? { id } : "skip")`.

A domain's client hooks (optional thin wrappers) live in
`features/<domain>/hooks.ts`. Raw `ConvexReactClient` is allowed only in provider
wiring (`app/providers.tsx`) — never in a component.

**Check:** flag TanStack Query / `fetch` / manual REST for Convex data, or a
`ConvexReactClient` built inside a component.

## 5. Forms = react-hook-form + zodResolver + shadcn `Form` `MAJOR`

Forms use `useForm` with `zodResolver(domainSchema)` and render fields with the
shadcn `Form`/`FormField`/`FormItem`/`FormMessage` primitives (`components/ui/form`).
No raw `useState`-controlled forms; the zod domain schema is the single validation
source.

```tsx
const form = useForm<ChallengeInput>({
  resolver: zodResolver(challengeInput),
  defaultValues: { title: "", businessProblem: "", successCriteria: [] },
});
const create = useMutation(api.challenges.create);
const onSubmit = form.handleSubmit((v) => create(v));
```

Dialogs/modals live in `features/<domain>/components/` and must **remount per
record** (conditionally rendered with the record non-null) — `defaultValues` only
seed on mount and do not re-sync.

**Check:** a new form uses `useForm` + `zodResolver` + shadcn `Form`, not raw
`useState`; validation reuses the domain zod schema.

## 6. Convex server rules `MAJOR`

- `query` = pure read. `mutation` = read+write, no external I/O. Side effects and
  external calls (Claude / Anthropic API, `fetch`, GitHub) go in an `action`, which
  persists results via an `internalMutation`.
- **Ownership from identity, never the client.** Get the caller via
  `ctx.auth.getUserIdentity()` (or the auth helper); never trust a `userId` passed
  in `args` for authorization. Scope reads/writes to the authed user.
- Index every query you filter/sort on (`withIndex`), never `.filter()` over a full
  table scan for hot paths.

## 7. UI = shadcn/ui `MAJOR`

Build with the installed shadcn primitives in `components/ui/*` (new-york style,
Tailwind v4 tokens). Add missing ones with `pnpm dlx shadcn@latest add <name>`.
Don't hand-roll styled buttons/inputs/dialogs. Tables use shadcn `Table` (compose
TanStack Table only if a screen truly needs sorting/pagination).

---

## Working agreement (parallel work, one branch)

- **Own disjoint files.** Each contributor/agent owns a feature folder
  (`features/<domain>/` + `app/(app)/<route>/`) and at most one convex file
  (`convex/<domain>.ts`). Do not edit another owner's files.
- **Shared files are coordinated, not raced:** `convex/schema.ts`,
  `app/providers.tsx`, `app/layout.tsx`, root configs, `package.json`. Change these
  only when it's your assigned task; announce it.
- Keep `main` green: `pnpm --filter web build` must pass before you push.
- Never commit `.env.local` or `convex/_generated` (gitignored).

## Commands

```bash
pnpm install
pnpm --filter @thenextcraft/backend dev   # convex dev (login + codegen + deploy)
pnpm --filter web dev                      # frontend
pnpm dev                                   # both via turbo
pnpm --filter web build                    # verify before push
```
