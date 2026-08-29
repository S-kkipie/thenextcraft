# thenextcraft

**Plataforma de hiring por proof-of-work.** No es freelance, no es hackathon-evento: es un puente directo de *un problema real de negocio → una contratación*.

> Los devs (builders / shippers) resuelven retos de negocio reales publicados por startups, shipean una solución pública, y la mejor gente termina contratada — no por su CV, sino por lo que construyó.

---

## El loop

```
reto de negocio  →  build  →  ship (link público)  →  AI evalúa + rankea  →  shortlist  →  hire
```

- La **startup** publica un **reto = su problema de negocio real** + criterios de éxito medibles.
- **Muchos** builders shipean, cada uno, su propia solución pública (repo / link; video o audio más adelante).
- **La plataforma nunca corre código.** El entregable es siempre un **link / repo**, no ejecución.
- La **AI hace el filtro pesado** (100 → 10, score comparable). La **startup toma la decisión final** (10 → hire).

**Outcome:** contratación / contacto caliente — resolviste *su* problema.
**Byproduct:** portfolio verificable + badges (`shipped`, `startup-approved`, `top 10%`).

---

## Evaluación (en orden de prioridad)

1. **¿Resuelve el reto de negocio?** — *primario.* Fit de la solución vs. los criterios de éxito de la startup. Se juzga como producto, no como código. AI evalúa contra criterios estructurados; la startup confirma.
2. **Calidad de build** — AI static review: arquitectura, seguridad, legibilidad, calidad de código.
3. **Autoría y entendimiento** — **humano.** La AI genera preguntas a partir de *tu* diff, pero **respondes por video o audio**, o escala a una **entrevista gestionada por la startup**. Es la capa de confianza anti-AI-slop y el puente hacia el hire — no un quiz automático.

---

## Qué nos diferencia

| | Otros | thenextcraft |
|---|---|---|
| **Forke** | micro-tasks + payout instantáneo, 1 dev ↔ 1 task | reto de negocio, **hire**, N devs **ranked** |
| **Kaggle** | accuracy de un modelo | solución de **negocio** juzgada por fit |
| **DoraHacks / Devpost** | evento + premios, jueces humanos | **continuo + hiring**, AI shortlist |

**Moat:** la defensa humana de tu propio código (video/audio → entrevista). Prueba autoría real en la era de la AI — lo que ningún competidor tiene.

---

## Stack (intención)

- **Backend:** [Convex](https://www.convex.dev/) — DB reactiva, funciones TS, realtime sync, auth, file storage.
- **Frontend:** Next.js / React.
- **Integración clave:** GitHub (repos, historial de commits para señales de autoría).

---

## Contexto

Nace en el track **Learning by Shipping** de [The Next Craft](https://thenextcraft.org/es) — *"menos escuela, más hacer"*. Convex es sponsor del evento.

## Monorepo

Turborepo + pnpm.

```
apps/web/          Next.js 16 (App Router, TS, Tailwind v4) → Vercel
packages/backend/  Convex (schema + funciones)             → Convex Cloud
```

## Setup local

```bash
pnpm install

# 1) backend: login Convex + genera _generated + levanta deployment dev
pnpm --filter @thenextcraft/backend dev      # = npx convex dev

# 2) copia la URL que imprime Convex a apps/web/.env.local
cp apps/web/.env.local.example apps/web/.env.local
#   NEXT_PUBLIC_CONVEX_URL=<url del deployment>

# 3) frontend (o `pnpm dev` para todo con turbo)
pnpm --filter web dev
```

## Demo: AI Technical Judge

La ruta [`/judge`](http://localhost:3000/judge) permite pegar la URL raíz de un
repositorio público de GitHub y observar una revisión técnica estática en tiempo
real. No requiere GitHub OAuth, no clona ni ejecuta el proyecto y no evalúa
business fit ni autoría.

Esta primera versión es una demo local/privada. La mutación de inicio no exige
login y puede consumir créditos de OpenAI; no publiques el deployment hasta
agregar autenticación y rate limiting.

Configura los secretos únicamente en el deployment de Convex:

```bash
# requerido
pnpm --filter @thenextcraft/backend exec convex env set OPENAI_API_KEY

# opcionales
pnpm --filter @thenextcraft/backend exec convex env set OPENAI_MODEL gpt-5.6-terra
pnpm --filter @thenextcraft/backend exec convex env set GITHUB_TOKEN
```

`OPENAI_MODEL` usa `gpt-5.6-terra` por defecto. `GITHUB_TOKEN` no se envía al
navegador ni otorga acceso a repos privados; solo eleva el límite de lectura de
la API pública de GitHub. Nunca agregues `OPENAI_API_KEY` a un archivo `.env` del
frontend.

La demo analiza un snapshot del branch principal con límites transparentes: 40
archivos de texto, 30.000 caracteres por archivo y 180.000 caracteres totales.
El reporte conserva metadata, cobertura, scores, uso y evidencia validada, pero
no almacena el código fuente.

```bash
pnpm --filter @thenextcraft/backend test
pnpm --filter @thenextcraft/backend typecheck
pnpm --filter web lint
pnpm --filter web build
```

## Estado

Concepto lockeado. **Demo funcional del AI Technical Judge** sobre repositorios
públicos. Pendiente: auth real (Convex Auth + GitHub OAuth), business-quality
scoring, ranking entre submissions y proof of authorship.
