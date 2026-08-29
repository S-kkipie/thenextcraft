# thenextcraft — Design Foundation

> **Warm craft minimal.** Ground cálido tipo `thenextcraft.org`, minimalismo monocromo de
> `crafter.run` con **un único acento cálido** (tan/amber, hue 40), foundation táctil de
> Duolingo (profundidad 3D, rounding, hover, shadow) — **sin sus colores** — y fondo
> **líquido** (shader fbm domain-warp, no "bolas").

Preview vivo: abre **`docs/design-foundation.html`** en el navegador (o `python3 -m http.server`).
Esto es la fuente de verdad visual. Todo se construye sobre **shadcn/ui (new-york)** + Tailwind v4
usando estos tokens. **App dark-only** para el MVP.

Reglas de producto que el diseño respeta:
- La plataforma **nunca corre código** — el AI Judge es **estático**. Nada de latency/throughput/tests-ejecutados.
- **Streak · Nivel · XP = capa de progreso sobre señales reales** (shipped · startup-approved · AI review · autoría verificada). No es un RPG.

---

## 1. Color tokens

Fuentes: `thenextcraft.org` (`#1a1a17`, muted `#6f6a5d`) · `crafter.run` (near-black + acento `hsl(40,26%,29%)`).

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#1A1A17` | ground base |
| `--ink-2` | `#131310` | wells (tracks, inputs, hero deep) |
| `--panel` | `#201F1B` | card surface |
| `--panel-2` | `#272520` | raised surface |
| `--line` | `#33302A` | hairline border |
| `--line-2` | `#403C34` | borde fuerte / edge 3D |
| `--text` / `--cream` | `#F1EDE4` | texto principal (crema) |
| `--cream-edge` | `#C7C1B2` | edge 3D del botón crema |
| `--muted` | `#6F6A5D` | texto secundario |
| `--faint` | `#55524A` | texto terciario |
| `--sand` | `#C6A15B` | **acento primario** (amber): links, XP, focus ring, active |
| `--sand-edge` | `#8C6E33` | edge 3D del botón amber |
| `--tan` | `#5D5037` | surface cálida / barras secundarias |
| `--terra` | `#C56A3D` | streak / flame |
| `--sage` | `#94A96B` | semántico good |
| `--rust` | `#C0554B` | semántico bad / destructive |

Semánticos son **terrosos, sin neón**. El acento vive en un solo lugar (amber); todo lo demás es near-black + crema.

---

## 2. Tipografía

| Rol | Stack | Uso |
|---|---|---|
| display | `ui-rounded, "SF Pro Rounded", system-ui` | titulares, números de juego (nivel/XP/score), botones |
| body | `-apple-system, "Segoe UI", Roboto, system-ui` | lectura |
| mono | `ui-mono, "SF Mono", "JetBrains Mono"` | datos (`score 87 · rank #3/42`) |

- Headings: `font-weight:800–900`, `letter-spacing:-.02em`, `text-wrap:balance`.
- Números en columnas: `font-variant-numeric:tabular-nums`.
- Eyebrows: 12px, `800`, `letter-spacing:.14em`, uppercase, color `--faint`.
- Sin webfonts externas (CSP en artifacts). Si se quiere Nunito/Baloo real → inline `@font-face` data-URI.

---

## 3. Forma & espaciado

- Radios: `--r:16px` (cards), `--r-sm:11px`, botones `12px`. Editorial, no burbujeante.
- Card padding `22px`. Grid gap `20px`. Container `max-width:1080px`, `padding:0 24px`.
- Layout con **flex/grid + gap**, nunca margins per-elemento.

---

## 4. Foundation táctil (de Duolingo — solo mecánica)

**Profundidad = borde inferior sólido** (`box-shadow:0 4px 0 <edge>`). Hover levanta (`translateY(-1px)` + shadow crece a 5px). Click hunde (`translateY(3px)` + shadow a 1px). Esto **no** es el `Button` default de shadcn — es una variante nueva.

```css
.btn{
  font-family:var(--font-display);font-weight:800;font-size:15px;
  border:0;border-radius:12px;padding:13px 22px;cursor:pointer;
  transition:transform .08s ease,box-shadow .08s ease,filter .12s ease;
  display:inline-flex;align-items:center;gap:8px;user-select:none;text-decoration:none;
}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(3px)}

/* primary = crema (crafter monocromo) */
.btn-primary{background:var(--cream);color:var(--ink);box-shadow:0 4px 0 var(--cream-edge)}
.btn-primary:hover{box-shadow:0 5px 0 var(--cream-edge)}
.btn-primary:active{box-shadow:0 1px 0 var(--cream-edge)}

/* secondary = amber */
.btn-secondary{background:var(--sand);color:var(--ink);box-shadow:0 4px 0 var(--sand-edge)}
.btn-secondary:hover{box-shadow:0 5px 0 var(--sand-edge)}
.btn-secondary:active{box-shadow:0 1px 0 var(--sand-edge)}

/* ghost */
.btn-ghost{background:var(--panel-2);color:var(--text);border:1px solid var(--line-2);box-shadow:0 4px 0 var(--ink-2)}
.btn-ghost:hover{box-shadow:0 5px 0 var(--ink-2);border-color:var(--tan)}
.btn-ghost:active{box-shadow:0 1px 0 var(--ink-2)}

/* danger = outline brick */
.btn-danger{background:transparent;color:var(--rust);border:2px solid var(--rust)}
.btn-danger:hover{background:rgba(192,85,75,.08)}
.btn-danger:active{transform:translateY(2px)}
```

**Cards** también levantan en hover:

```css
.card{
  background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px;
  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease;
}
.card:hover{transform:translateY(-2px);border-color:var(--line-2);box-shadow:0 14px 34px -18px rgba(0,0,0,.8)}
```

Respetar `@media(prefers-reduced-motion:reduce){ .btn,.card{transition:none} }`.

---

## 5. Fondo líquido (shader)

WebGL fragment shader — **fbm con domain-warp** (flujo continuo, vetas amber sutiles al 22%), grain + vignette. NO metaballs/bolas. Fallback CSS a gradiente cálido si no hay WebGL. Respeta reduced-motion (1 frame estático). Código completo en `docs/design-foundation.html` (`<script>` al final). Núcleo:

```glsl
vec2 q = vec2(fbm(p+vec2(0.,t)),      fbm(p+vec2(5.2,-t)));       // warp 1
vec2 r = vec2(fbm(p+2.*q+vec2(1.7,9.2)+.12*t), fbm(p+2.*q+vec2(8.3,2.8)-.10*t)); // warp 2
float f = fbm(p + 2.4*r);
vec3 col = mix(ink, brown, smoothstep(.15,.95,f));
col = mix(col, amber, pow(smoothstep(.55,1.,length(r)),2.)*0.22); // sheen
```

Reservado para hero / superficies grandes vacías. No detrás de texto denso.

---

## 6. Componentes clave (recetas en el HTML)

- **Challenge card** — logo startup, nombre+tamaño, reward `$` (amber), título del problema de negocio, `--desc`, tech pills, meta (`👥 participantes · ⏱ días · 🎯 criterios`), botón `Participar` full-width.
- **Passport** — avatar, nombre `@handle`, **ring de nivel** (SVG stroke-dasharray, `--sand`), **XP bar** (`--sand`→`--terra`), **streak** `🔥`, stats (shipped / approved / avg-judge), skill pills, badges.
- **AI Judge card** — score grande `/100`, rank `#n/N`, barras (Fit al reto = **primary** en `--sand` con ★, resto en `--tan`), fuertes/revisar.
- **Badges** — chips terrosos: `First ship` (terra), `Shipped ×n` (sage), `Startup-approved` (sand), `Top 10%` (gold), `Autoría verificada` (tan).
- **Progreso mini** (nav): `🔥 streak` + pill nivel (conic-gradient) + XP.

Ring de nivel (patrón SVG):
```html
<svg width="60" height="60" viewBox="0 0 60 60" style="transform:rotate(-90deg)">
  <circle cx="30" cy="30" r="25" fill="none" stroke="#33302A" stroke-width="6"/>
  <circle cx="30" cy="30" r="25" fill="none" stroke="#C6A15B" stroke-width="6"
          stroke-linecap="round" stroke-dasharray="157" stroke-dashoffset="28"/>
</svg>  <!-- offset = 157 * (1 - progreso) -->
```

---

## 7. Wiring en `apps/web` (shadcn + Tailwind v4)

App **dark-only** MVP. En `apps/web/app/globals.css`, mapea los tokens shadcn a la paleta (pega dentro de `:root` **y** `.dark`, o fuerza `.dark` en `<html>`):

```css
:root, .dark {
  --background:#1A1A17;  --foreground:#F1EDE4;
  --card:#201F1B;        --card-foreground:#F1EDE4;
  --popover:#201F1B;     --popover-foreground:#F1EDE4;
  --primary:#F1EDE4;     --primary-foreground:#1A1A17;   /* crema, crafter monocromo */
  --secondary:#272520;   --secondary-foreground:#F1EDE4;
  --muted:#201F1B;       --muted-foreground:#6F6A5D;
  --accent:#272520;      --accent-foreground:#F1EDE4;
  --border:#33302A;      --input:#403C34;   --ring:#C6A15B; /* focus amber */
  --destructive:#C0554B; --destructive-foreground:#F1EDE4;
  --radius:0.9rem;

  /* brand extras (no estándar shadcn — para nuestras piezas) */
  --sand:#C6A15B; --sand-edge:#8C6E33; --tan:#5D5037;
  --terra:#C56A3D; --sage:#94A96B; --cream:#F1EDE4; --cream-edge:#C7C1B2;
}
```

- Botones chunky 3D → nueva **variante** del `Button` shadcn (o clases `.btn-*` arriba). No romper el `Button` base.
- Focus ring visible siempre (`--ring` amber) — accesibilidad.
- Landing puede usar el hero + shader líquido tal cual del HTML.

---

## 8. Pantallas MVP (para orientar la landing)

Loop: **reto de negocio → ship (link) → AI Judge estático + rank → autoría (viva humana) → shortlist → hire.**

`Home/Dashboard` · `Challenges (list)` · `Challenge Detail` · `Ship` · `AI Judge result` · `Passport /u/[handle]` · `Startup Shortlist` · `Publicar reto` · `Auth/Onboarding` · `Notifications` (light) · `Opportunity/contacto` (light).

Nav — Builder: `HOME · CHALLENGES · PASSPORT · 🔔` · Startup: `HOME · MIS RETOS · SHORTLIST · PUBLICAR · 🔔`.
