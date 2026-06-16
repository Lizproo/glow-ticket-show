# GlowTicket – Reingeniería Admin + Planimetría + Tiempo Real

Plan dividido en 4 fases entregables. Cada fase es funcional por sí sola; te pido aprobación antes de pasar a la siguiente para no romper nada.

---

## FASE 1 — Cimientos de datos (Backend)

Migrar de eventos hardcodeados (`src/lib/data.ts`) a base de datos real con Realtime.

**Tablas nuevas en Supabase:**
- `events` — título, descripción, categoría, fecha, hora, lugar, ciudad, imagen, galería (jsonb), organizador, estado (activo/agotado/cancelado/proximamente), capacidad, tipo de recinto, políticas, `deleted_at` (soft delete)
- `venue_sections` — zonas por evento: nombre, color, precio, capacidad, tipo (vip/general/palco/escenario/pasillo), geometría (jsonb con shape + coords del editor visual)
- `seats` — asiento individual: section_id, fila, número, x/y, estado base
- `orders` — agrupa compras (un order = varios tickets)
- Extender `tickets`: añadir `order_id`, `seat_id` (FK), `section_id` (FK), `price_paid`
- Añadir rol `organizer` al enum `app_role`

**Seguridad:**
- RLS: lectura pública de `events` (solo `deleted_at IS NULL` y `status != 'cancelado'`), escritura solo admin/organizer
- GRANTs explícitos para anon/authenticated/service_role según política
- Realtime habilitado en `events`, `venue_sections`, `seats`, `tickets`

**Seed:** migrar los eventos actuales de `data.ts` a la tabla `events` para no perder contenido.

---

## FASE 2 — Constructor Visual de Planimetría (el diferenciador)

Editor SVG interactivo estilo Ticketmaster en `/admin/venues/:eventId`.

**Plantillas pre-hechas (1 clic):**
- Teatro: escenario + platea curva + preferencia + balcón + palcos laterales
- Coliseo: escenario central + tribunas en arco (Norte/Sur/Este/Oeste) + VIP + General
- Estadio: campo + 4 tribunas + palcos superiores
- Auditorio: filas rectas en abanico
- Personalizado: lienzo en blanco

**Herramientas del editor:**
- Dibujar zonas (rectángulo, polígono, arco curvo)
- Drag para mover/redimensionar, snap a grid
- Panel lateral: nombre, color, precio, filas × asientos, tipo (VIP/General/Palco/Escenario/Pasillo/Acceso)
- Botón "Generar asientos" que crea registros en `seats` con coords calculadas
- Preview en tiempo real con zoom/pan (ya tenemos `react-zoom-pan-pinch`)
- Guardar todo en `venue_sections` + `seats`

**Render para usuario final:**
- `SeatSelectionScreen` lee `venue_sections` + `seats` por evento
- Realtime: si otro usuario compra → asiento se marca vendido al instante para todos
- Hold temporal de 5 min al seleccionar (campo `held_until` + `held_by`)

---

## FASE 3 — Panel de Administrador

Layout con sidebar (shadcn `Sidebar`) en ruta `/admin`.

**Módulos:**
1. **Dashboard** — KPIs reales (eventos totales/activos/agotados, usuarios, tickets vendidos, ingresos) + gráficos `recharts` (ventas por mes, top eventos, ingresos por evento, ocupación por zona)
2. **Eventos** — tabla con búsqueda, filtros (categoría/estado/fecha), crear/editar (formulario completo con React Hook Form + Zod + upload de imágenes a Supabase Storage), soft delete con papelera y restaurar, botón "Editar planimetría" → Fase 2
3. **Usuarios** — lista actual mejorada, asignar rol admin/organizer/user
4. **Ventas** — historial de orders con filtros

**Permisos:** admin ve todo, organizer solo sus eventos (campo `created_by`).

---

## FASE 4 — Perfil y Calidad Final

**Perfil de usuario:**
- Añadir teléfono y fecha de nacimiento a `profiles` (ya hay phone)
- Mis Entradas: separar Próximos / Pasados leyendo `event_date`, mostrar QR + zona + asiento + precio
- Historial de Compras: leer de `orders` con método de pago y total
- Favoritos: ya existe, conectar con nueva tabla `events`

**Calidad:**
- Limpiar `src/lib/data.ts` (queda solo para tipos)
- Revisar consola, eliminar warnings
- Verificar responsive en móvil y desktop
- Tests de las queries críticas

---

## Detalles técnicos

**Stack añadido:** `recharts` (ya instalado), `react-hook-form` + `zod` (ya), Supabase Storage para imágenes (bucket `event-images` público en lectura).

**Realtime:** un canal por evento en `SeatSelectionScreen`, cleanup en unmount.

**Rutas nuevas:** `/admin`, `/admin/events`, `/admin/events/new`, `/admin/events/:id/edit`, `/admin/events/:id/venue`, `/admin/users`, `/admin/sales`. Requiere migrar `Index.tsx` de state-based a React Router (cambio aislado, sin tocar lógica existente).

**Compatibilidad:** los eventos actuales se seedean en BD con el mismo `id` (slug) → tickets existentes siguen funcionando.

---

## Riesgos

- Migrar `Index.tsx` a Router toca navegación global → lo hago en commit aislado y verifico cada pantalla
- Editor visual de planimetría es la pieza más compleja (≈40% del esfuerzo de Fase 2)
- Storage de imágenes requiere bucket nuevo + políticas

---

## Preguntas antes de arrancar

1. **¿Apruebo Fase 1 (BD + seed) ya** y avanzamos secuencial, o quieres que ejecute todo de corrido sin pausas?
2. **Imágenes:** ¿subida real con Supabase Storage o por ahora solo URL pegada?
3. **Editor de planimetría:** ¿empezamos con las 4 plantillas (teatro/coliseo/estadio/auditorio) editables, o también el modo "lienzo en blanco" desde el día 1?
4. **Rol organizer:** ¿lo activamos ahora o queda solo admin/user y dejamos organizer para después?
