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

## Estado

Concepto lockeado. **MVP demoable pendiente de definir** (pantallas + flujo mínimo).
