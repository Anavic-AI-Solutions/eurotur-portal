# Informe de Cambios — Eurotur Portal

**Fecha:** 20 de agosto de 2026
**Rama:** `main` (5 commits por delante de `origin/main`)

---

## Resumen

Se implementó navegación por teclado en el buscador global, se creó una página dedicada de resultados de búsqueda, se mejoró la presentación visual de múltiples páginas del portal y se agregaron imágenes e infraestructura de desarrollo.

---

## Commits

### 1. `e8b6d72` — feat(search): add keyboard navigation to global search dropdown

**Archivo:** `resources/js/layouts/portal-layout.tsx`

**Problema:** El buscador global no respondía a teclas — no se podía navegar con flechas ni ejecutar acciones con Enter.

**Solución:**
- Se agregó estado `activeIndex` y `resultRefs` para manejar la selección por teclado
- **Flecha ↓**: navega hacia abajo en los resultados (wrap al inicio)
- **Flecha ↑**: navega hacia arriba (wrap al final)
- **Enter con resultado seleccionado**: abre la URL en nueva pestaña
- **Enter sin resultado seleccionado**: navega a `/busqueda?q=...` (ver commit #2)
- **Escape**: cierra el dropdown
- Auto-scroll del resultado activo mediante `scrollIntoView`
- Reset automático del índice activo al cambiar la query o recibir nuevos resultados
- CSS: se agregó clase `.search-result-active` con el mismo estilo rojo del hover

---

### 2. `6a20b63` — feat(search): add dedicated search results page at /busqueda

**Archivos:**
- `app/Http/Controllers/Portal/SearchResultsController.php` (nuevo)
- `resources/js/pages/portal/search-results.tsx` (nuevo)
- `routes/portal.php` (modificado)

**Descripción:**
- **SearchResultsController**: reutiliza la misma lógica de búsqueda del `SearchController` (expansión de sinónimos, matching contra `SectorItem` y `SearchStaticEntry`) pero devuelve una página Inertia en vez de JSON
- **Ruta**: `GET /busqueda` → `SearchResultsController` (nombre: `portal.search-results`)
- **Página**: muestra el query, cantidad de resultados, y cada resultado como link con hover rojo
- Límite de 50 resultados (vs 20 del autocomplete) para una visión completa
- El `GlobalSearch` navega a esta página vía `router.visit()` de Inertia al presionar Enter sin resultado seleccionado

---

### 3. `f4ecd10` — feat(portal): add image support and UI polish to portal pages

**Archivos:**
- `resources/js/components/portal/image-slot.tsx`
- `resources/js/pages/portal/home.tsx`
- `resources/js/pages/portal/institucional.tsx`
- `resources/js/pages/portal/qrated.tsx`

**Cambios:**
- **ImageSlot**: nuevas props `grayscale` (filtro escala de grises) y `contain` (object-fit: contain en vez de cover)
- **Home**: enlace de Mesa de Información cambiado a ruta interna, layout de portada mejorado
- **Institucional**: agregadas imágenes de Patagonia y Ushuaia con filtro grayscale
- **Q.Rated**: agregadas imágenes de categorías (creatividad, herramientas, proveedores) con grayscale

---

### 4. `9719c38` — fix(portal): capitalize section headings across portal pages

**Archivos:**
- `resources/js/pages/portal/exchange-rate.tsx`
- `resources/js/pages/portal/innovacion.tsx`
- `resources/js/pages/portal/mesa.tsx`
- `resources/js/pages/portal/search-admin.tsx`

**Cambios:** Normalización de mayúsculas en títulos de sección:
| Archivo | Antes | Después |
|---------|-------|---------|
| exchange-rate | `histórico bna billetes` | `Histórico BNA billetes` |
| innovacion | `automatizaciones` | `Automatizaciones` |
| innovacion | `instructivos ia` | `Instructivos IA` |
| mesa | `guías paso a paso` | `Guías paso a paso` |
| search-admin | `keywords por ítem` | `Keywords por ítem` |
| search-admin | `páginas y accesos indexados` | `Páginas y accesos indexados` |
| search-admin | `tesauro de sinónimos` | `Tesauro de sinónimos` |

---

### 5. `ab8f36b` — chore: add portal images, dev Dockerfile, and update gitignore files

**Archivos:**
- `docker/Dockerfile.dev` (nuevo)
- `public/img/portal/institucional/` — ushuaia-01.jpg, ushuaia-02.jpg, ushuaia-03.jpg
- `public/img/portal/qrated/` — creatividad.jpg, herramientas.jpg, proveedores.jpg
- Múltiples `.gitignore` actualizados (bootstrap/cache, storage/)

---

## Archivos modificados (resumen)

| Archivo | Tipo | Commit |
|---------|------|--------|
| `resources/js/layouts/portal-layout.tsx` | Modificado | #1 |
| `app/Http/Controllers/Portal/SearchResultsController.php` | Nuevo | #2 |
| `resources/js/pages/portal/search-results.tsx` | Nuevo | #2 |
| `routes/portal.php` | Modificado | #2 |
| `resources/js/components/portal/image-slot.tsx` | Modificado | #3 |
| `resources/js/pages/portal/home.tsx` | Modificado | #3 |
| `resources/js/pages/portal/institucional.tsx` | Modificado | #3 |
| `resources/js/pages/portal/qrated.tsx` | Modificado | #3 |
| `resources/js/pages/portal/exchange-rate.tsx` | Modificado | #4 |
| `resources/js/pages/portal/innovacion.tsx` | Modificado | #4 |
| `resources/js/pages/portal/mesa.tsx` | Modificado | #4 |
| `resources/js/pages/portal/search-admin.tsx` | Modificado | #4 |
| `docker/Dockerfile.dev` | Nuevo | #5 |
| `public/img/portal/**` | Nuevos | #5 |
| `.gitignore` (×10) | Modificados | #5 |

---

## Verificación

```bash
# Navegación por teclado en el buscador
npm run dev
# 1. Escribir 2+ caracteres → dropdown aparece
# 2. Flechas ↑↓ → navega resultados con resaltado rojo
# 3. Enter → abre resultado en nueva pestaña
# 4. Enter sin selección → navega a /busqueda?q=...
# 5. Escape → cierra dropdown

# Página de resultados
# Navegar a /busqueda?q=factura → muestra resultados completos
```
