
# GlowTicket — Propuesta de Reingeniería Integral

> Documento de arquitectura previo a la implementación. No se generará código hasta tu aprobación. Al final encontrarás un set de decisiones que necesito confirmes para arrancar la Fase 2.

---

## 1. Análisis del estado actual

**Stack hoy:** React 18 + Vite + TS + Tailwind + shadcn/ui, Lovable Cloud (Supabase) con tablas `profiles`, `user_roles`, `tickets`, `favorites`, edge functions `chatbot-service` y `admin-service`. Eventos viven en `src/lib/data.ts` (mock).

**Problemas detectados:**
- Eventos hardcoded → admin no puede crear/editar realmente.
- Tickets generan QR estático en compra → reventa/duplicación trivial.
- HomeScreen sobrecargado, hero ocupa demasiado viewport, secciones redundantes (Tendencias + Para Ti + Categorías + Próximos).
- SearchScreen sin `scrollToTop` al cambiar de pestaña/buscar, filtros parciales.
- SeatSelection sin zoom, sin estados claros, muestra porcentajes.
- ProfileScreen mezcla favoritos, vistos, preferencias y cuenta.
- MyTickets sin separación activos/usados/expirados real.
- BottomNav `px-1` se rompe con 6 ítems (admin), tipografía grande, sin separación segura.
- Chatbot tapa BottomNav en `/tickets` y `/profile`.
- Sin accesibilidad (daltonismo, contraste, focus-visible auditable).
- Admin panel es solo lectura, sin CRUD real.
- Sin antifraude: QR no rota, no se invalida tras escaneo, no hay log de accesos.

---

## 2. Arquitectura Frontend propuesta

### 2.1 Estructura de carpetas
```text
src/
  app/                    # entrypoints, providers, router
  features/               # vertical slices por dominio
    auth/
    events/
    tickets/
    checkout/
    seats/
    profile/
    admin/
    chatbot/
  shared/
    components/           # UI compartida (no shadcn)
    ui/                   # shadcn primitives
    hooks/
    lib/                  # utils, formatters, api client
    types/
    a11y/                 # provider daltonismo, contrast helpers
  integrations/supabase/  # auto-gen, no tocar
  styles/
```
Cada `feature/` contiene `components/`, `hooks/`, `api/` (queries TanStack), `schemas/` (zod), `types.ts`.

### 2.2 Componentes
- Atómico-funcional: primitivos shadcn → moléculas (`EventCard`, `SeatCell`) → organismos (`EventGrid`, `SeatMap`) → screens.
- Componentes "tontos" reciben props; lógica vive en hooks.
- Variantes con `cva`, tokens semánticos HSL (`--primary`, `--surface`, `--seat-available`...).

### 2.3 Gestión de estado
- **Servidor:** TanStack Query (cache, revalidación, optimistic updates, infinite scroll).
- **Cliente global:** Zustand para UI persistente ligera (tema, accesibilidad, onboarding, sesión local).
- **Auth/Sesión:** `useAuth` ya existe, se mantiene.
- **Formularios:** react-hook-form + zod.
- Sin Redux: overkill.

### 2.4 Navegación
- `react-router-dom` con rutas reales (`/`, `/search`, `/event/:id`, `/event/:id/seats`, `/checkout/:id`, `/tickets`, `/tickets/:id`, `/profile`, `/admin/*`, `/auth`).
- Reemplaza el `useState<Screen>` actual de `Index.tsx` → habilita deep links, back nativo, SEO básico.
- Layout shell con `<Outlet/>` y un único `<main>`.
- Guards: `<RequireAuth/>`, `<RequireRole role="admin"/>`.

### 2.5 Responsive
- Mobile-first (`max-w-md` solo para screens "app"; admin desktop usa layout fluido `lg:max-w-6xl`).
- Breakpoints Tailwind: `sm` 640, `md` 768 tablet, `lg` 1024 desktop, `xl` 1280 foldable abierto.
- `h-dvh` en vez de `h-screen`, `safe-top`/`safe-bottom` (env(safe-area-inset-*)).
- Container queries para `EventCard` y `SeatMap`.

### 2.6 Accesibilidad
- Provider `A11yProvider` con: filtros CSS para daltonismo (Protanopia/Deuteranopia/Tritanopia vía SVG `feColorMatrix`), modo alto contraste, tamaño de texto.
- Tap target mínimo 44x44.
- `aria-label` en todos los iconos, focus ring visible, roles correctos.
- `prefers-reduced-motion` respetado.
- Toasts con `aria-live="polite"`.

### 2.7 Rendimiento
- Code splitting por ruta (`React.lazy`).
- Imágenes: `loading="lazy"`, `decoding="async"`, srcset, formato WebP/AVIF en assets generados, `aspect-*`.
- Virtualización (`@tanstack/react-virtual`) en listas largas (admin users, tickets históricos, mapa de asientos grande).
- Memo selectiva (`memo`, `useMemo`) solo donde profiler lo justifique.
- Prefetch de detalle de evento al hover/visible.
- Service worker básico para cache de assets (opcional fase 2).

---

## 3. Arquitectura Backend propuesta

Lovable Cloud (Supabase) como plataforma. Se mantiene; lo refactorizamos en estilo *clean* dentro de Edge Functions + Postgres.

### 3.1 Capas
```text
supabase/functions/<service>/
  index.ts            # HTTP entry (Deno serve) — sólo wiring
  controller.ts       # parsea request, llama service, formatea respuesta
  service.ts          # reglas de negocio puras
  repository.ts       # acceso a datos (supabase client / SQL)
  dto.ts              # zod schemas in/out
  middleware/
    auth.ts           # valida JWT, extrae user
    role.ts           # exige rol
    rateLimit.ts
    errorHandler.ts
  errors.ts           # AppError, NotFound, Forbidden...
```

### 3.2 Microservicios (edge functions)
| Servicio | Responsabilidad |
|---|---|
| `auth-service` | hooks post-signup, asignación de rol, perfil |
| `events-service` | CRUD eventos, categorías, zonas, asientos |
| `tickets-service` | compra (transacción), historial, estado |
| `qr-service` | emisión de token QR dinámico firmado (HS256), refresh 30s |
| `validation-service` | escaneo en puerta: valida token, marca usado, log |
| `payments-service` | integración pasarela (Stripe sandbox inicial) |
| `notifications-service` | email transaccional + push (futuro) |
| `admin-service` | dashboard + métricas (ya existe, se amplía) |
| `chatbot-service` | Lovable AI Gateway (ya existe) |

### 3.3 Flujo de request
`Client → Edge Function (controller) → middleware (auth, role, validate DTO) → service (business) → repository (DB) → response DTO`. Errores convertidos por `errorHandler` a `{code, message}` con status HTTP correcto.

### 3.4 Manejo de errores
- Clase `AppError(code, status, message, details?)`.
- Logging estructurado (`console.log(JSON.stringify(...))`).
- Nunca exponer stack al cliente.

### 3.5 Escalabilidad
- Edge functions stateless → horizontal por default.
- Lógica pesada (reportes) → vistas materializadas + `pg_cron`.
- Realtime (Supabase channels) para mapa de asientos y validación en puerta.
- Índices por `event_id`, `user_id`, `qr_token_id`, `(event_id,status)`.

---

## 4. Base de datos — Decisión

**Selección: PostgreSQL (Supabase / Lovable Cloud).**

**Justificación:**
- Ya estamos en Lovable Cloud → cero migración, costo $0 hasta volumen alto.
- ACID real → crítico para compras/asientos (evita doble venta con `SELECT ... FOR UPDATE`).
- RLS nativo → seguridad a nivel fila por usuario/rol.
- JSONB para campos flexibles (metadata de evento, settings).
- Extensiones: `pg_cron` (jobs), `pg_net` (webhooks), `pgcrypto` (tokens), `uuid-ossp`.
- Realtime y Storage incluidos.
- Escalabilidad: read replicas + connection pooling (PgBouncer). Suficiente hasta cientos de miles de tickets/día.

**Alternativas descartadas:**
- MongoDB: sin transacciones fuertes para asientos.
- Firebase/Firestore: caro por lectura, RLS menos expresivo, sin SQL para reportes admin.
- MySQL: viable pero pierde RLS nativo y ecosistema Supabase.

### 4.1 Modelo Entidad-Relación (resumen)
```text
auth.users (Supabase)
  └─ profiles (1:1)              full_name, avatar, phone, dni, birthdate
  └─ user_roles (1:N)            role enum

cities ──< venues ──< events
categories ──< events
organizers ──< events

events ──< zones ──< seats
events ──< promotions
events ──< notifications

profiles ──< purchases ──< tickets
purchases >── payment_methods
purchases >── payments

tickets ──< qr_tokens (1:N, sólo el último activo)
tickets ──< scan_logs

profiles ──< notifications_inbox
profiles ──< user_settings (1:1)

reports (vistas materializadas)
audit_logs (todo cambio sensible)
```

**Tablas detalladas (campos clave):**
- `profiles(user_id, full_name, avatar_url, phone, dni, birthdate, blocked, …)`
- `user_roles(user_id, role enum[admin,organizer,scanner,user])`
- `cities(id, name, country)`
- `venues(id, city_id, name, address, lat, lng, capacity)`
- `categories(id, slug, name, icon)` — Conciertos, Festivales, Deportes, Teatro, Conferencias, Otros
- `organizers(id, name, logo, contact_email)`
- `events(id, title, slug, description, category_id, venue_id, organizer_id, starts_at, doors_open_at, ends_at, cover_url, status enum[draft,published,cancelled,finished], qr_enabled_from, created_by, …)`
- `zones(id, event_id, name, color, price, capacity)`
- `seats(id, zone_id, row, number, status enum[available,held,sold,blocked])`
- `seat_holds(id, seat_id, user_id, expires_at)` — TTL 10 min
- `purchases(id, user_id, total, currency, status enum[pending,paid,failed,refunded], payment_id, created_at)`
- `tickets(id, purchase_id, event_id, zone_id, seat_id?, holder_name, status enum[active,used,expired,revoked], used_at, scanned_by, device_fingerprint)`
- `qr_tokens(id, ticket_id, token_hash, issued_at, expires_at, revoked)` — rota cada 30s
- `scan_logs(id, ticket_id, scanned_at, scanner_user_id, device_info, ip, result enum[ok,duplicate,expired,invalid,revoked])`
- `payment_methods(id, user_id, provider, last4, brand, exp, token)`
- `payments(id, purchase_id, provider, provider_ref, amount, status, raw jsonb)`
- `promotions(id, event_id, code, type enum[percent,fixed], value, max_uses, used, expires_at)`
- `notifications(id, user_id, type, title, body, data jsonb, read_at)`
- `user_settings(user_id, language, theme, daltonism enum, push_enabled, email_enabled)`
- `audit_logs(id, actor_id, action, entity, entity_id, before jsonb, after jsonb, at)`

Todas con `created_at`, `updated_at`, RLS, GRANTs explícitos, triggers `updated_at`.

---

## 5. APIs externas

| Categoría | Selección | Por qué | Costo | Alternativa |
|---|---|---|---|---|
| Geolocalización + mapas | **Mapbox** | Mejor diseño mobile, free tier 50k loads/mes | Free → $0.60/1k | Google Maps (más caro, mejor búsqueda) |
| Push | **Firebase Cloud Messaging** | Gratis ilimitado, Android+iOS+Web | $0 | OneSignal |
| OAuth | **Google + Apple** | Cubre 95% mobile | $0 | Email magic link |
| Email transaccional | **Resend** | DX excelente, React Email, integración Lovable | 3k/mes free | SendGrid |
| Storage de imágenes | **Supabase Storage** | Ya incluido, signed URLs, transformación | incluido | Cloudinary (mejor optimización on-the-fly) |
| Pagos | **Stripe** (start) + **PayPhone** (Ecuador local) | Stripe estándar mundial; PayPhone para LATAM | 2.9%+$0.30 / variable | PayPal, Mercado Pago |
| QR | **`qrcode`** (gen) + **`html5-qrcode`** (scan) | Open source, sin costo | $0 | ZXing |
| AI Chatbot | **Lovable AI Gateway (Gemini)** | Ya integrado, sin API key | incluido | OpenAI |
| Anti-bot | **Cloudflare Turnstile** | Gratis, mejor UX que reCAPTCHA | $0 | hCaptcha |

---

## 6. Seguridad y antifraude

### 6.1 QR dinámico (núcleo del sistema)
1. Al pagar → se crea `tickets.status = 'active'` **sin QR visible**.
2. Mensaje en la app: *"Tu QR se activará 3h antes del evento"* (configurable por evento vía `qr_enabled_from`).
3. Al abrir el ticket dentro de la ventana:
   - Cliente pide `POST /qr-service/issue` con `ticket_id`.
   - Server valida ownership, ventana de tiempo, status.
   - Genera **JWT HS256** firmado con `QR_SIGNING_SECRET`:
     `{ tid, jti, iat, exp=iat+45 }` (vida 45s, refresh cada 30s).
   - Guarda `qr_tokens(token_hash=sha256(jti), expires_at)`.
   - Devuelve el JWT, cliente lo pinta como QR.
4. Cada 30s el cliente vuelve a llamar `issue` → se invalida el anterior (`revoked=true`).

### 6.2 Validación en puerta
- Scanner (rol `scanner`) abre `/admin/scan` (cámara).
- Lee JWT → `POST /validation-service/scan { token, device_fingerprint }`.
- Server verifica firma + expiración + `jti` no revocado + `ticket.status='active'`.
- Marca ticket `used`, registra `scan_logs` (ts, scanner, device, ip, result).
- Respuestas: `ok` (verde), `duplicate` (rojo + datos del primer escaneo), `expired`, `revoked`.
- Tickets con >N intentos fallidos en X seg → flag `fraud_suspected`.

### 6.3 Captura de pantalla
- Web no puede bloquear screenshots → mitigaciones:
  - QR con marca de agua dinámica (nombre del titular + timestamp visible).
  - Refresh 30s hace inútil el screenshot pasados 45s.
  - Overlay sutil con CSS animado (degrada legibilidad fuera de pantalla en muchos OS).
  - Mensaje legal "compartir este QR invalida tu ticket".
- En futura app nativa (Capacitor): `FLAG_SECURE` Android + bloqueo iOS detección de screenshot.

### 6.4 Otras medidas
- RLS estricto en todas las tablas (ya base).
- Rate limiting en `qr-service` y `validation-service` (token bucket por user/ip).
- Validación zod en *todo* DTO de entrada.
- Auditoría (`audit_logs`) en cambios admin.
- HIBP check en passwords (`configure_auth`).
- CSP + headers seguros en `index.html`.
- Sin secretos en cliente; todos en Secrets de Lovable Cloud.

---

## 7. Flujos completos

### 7.1 Compra
```text
Usuario → Detalle evento → Selecciona zona/asientos
  → POST /seats/hold (TTL 10 min)
  → Checkout → POST /payments-service/intent
  → Stripe Elements (3DS si aplica)
  → Webhook /payments-service/webhook (status=paid)
  → tickets-service crea purchase + tickets (transacción)
  → Email Resend con confirmación
  → Push FCM "Tu compra fue confirmada"
```

### 7.2 Generación QR
```text
T-3h del evento → tickets-service marca qr_enabled=true
Usuario abre ticket → /qr-service/issue
  → JWT 45s → render QR
  → setInterval 30s → refresh (revoca anterior)
  → al salir de la pantalla, no se vuelve a emitir
```

### 7.3 Ingreso
```text
Scanner enfoca QR → /validation-service/scan
  → verify(jwt) + jti no usado + ticket active
  → UPDATE ticket SET status='used', used_at=now()
  → INSERT scan_logs
  → 200 OK con nombre y zona
  → Pantalla verde 1s
Si duplicate/expired/revoked → pantalla roja + motivo
```

---

## 8. Diagrama general
```text
┌─────────────────────────────────────────────┐
│                Mobile Web App                │
│  React + Vite + TS + Tailwind + shadcn       │
│  TanStack Query · Zustand · RHF+zod          │
└──────────────┬──────────────────────────────┘
               │ HTTPS / WSS
┌──────────────▼──────────────────────────────┐
│           Lovable Cloud (Supabase)           │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Edge Funcs  │  │  Postgres + RLS      │  │
│  │ auth        │──│  profiles, events,   │  │
│  │ events      │  │  tickets, qr_tokens, │  │
│  │ tickets     │  │  scan_logs, ...      │  │
│  │ qr          │  └──────────────────────┘  │
│  │ validation  │  ┌──────────────────────┐  │
│  │ payments    │──│  Storage (covers)    │  │
│  │ notify      │  └──────────────────────┘  │
│  │ admin       │  ┌──────────────────────┐  │
│  │ chatbot     │──│  Realtime channels   │  │
│  └─────────────┘  └──────────────────────┘  │
└──────┬──────┬──────┬──────┬──────┬─────────┘
       │      │      │      │      │
   Stripe  Resend  FCM   Mapbox  Lovable AI
```

---

## 9. Plan de escalabilidad
- Fase 1 (MVP, este sprint): single project Supabase, hasta ~10k usuarios.
- Fase 2: read replica + CDN para imágenes + caché HTTP en GET públicos.
- Fase 3: particionar `scan_logs` y `audit_logs` por mes; mover reportes a vistas materializadas refrescadas con `pg_cron`.
- Fase 4: separar `validation-service` a infra dedicada (picos en puertas), websockets para venues grandes.
- App nativa con Capacitor reutilizando 100% del front.

---

## 10. Riesgos técnicos
| Riesgo | Mitigación |
|---|---|
| Doble venta de asiento | `seat_holds` con TTL + transacción `SELECT FOR UPDATE` al confirmar |
| Reventa de QR | QR dinámico 30s + JWT + revocación |
| Pico en puerta del evento | Realtime + rate limit + degradación a validación offline firmada |
| Fuga de claves QR | `QR_SIGNING_SECRET` en Secrets, rotación trimestral |
| Pasarela caída | Reintentos exponenciales + estado `pending` visible al usuario |
| Bloqueo screenshot imposible en web | Watermark + rotación 30s + futuro Capacitor `FLAG_SECURE` |
| Migración de mock data a BD | Script de seed idempotente |
| RLS mal configurada | Linter Supabase + tests de policies por rol |

---

## 11. Plan de implementación (Fase 2, una vez aprobada esta arquitectura)

Lo ejecutaré por **épicas independientes** para mantener cada PR enfocada:

1. **Cimientos**
   - Router real (`react-router-dom`) + layouts + guards.
   - Refactor a `features/`, instalar TanStack Query + Zustand + RHF.
   - Provider de accesibilidad (daltonismo, contraste, reduced motion).

2. **Datos en BD**
   - Migración: `cities, venues, categories, organizers, events, zones, seats, seat_holds, promotions, notifications, user_settings, audit_logs, qr_tokens, scan_logs` + RLS + GRANTs + seed.
   - `events-service` CRUD.
   - Mover `src/lib/data.ts` a la BD.

3. **Rediseño UI mobile-first**
   - HomeScreen: hero compacto, orden nuevo, categorías barra horizontal, cards reducidas con peek, "Ver más", limpieza visual.
   - SearchScreen: `scrollToTop` en tab/búsqueda, filtros funcionales (fecha/mes/año/ciudad/tipo).
   - SeatSelection: zoom (`react-zoom-pan-pinch`), estados visuales, sin %.
   - Profile: editar perfil, cambiar password, settings, tickets, logout — todo funcional. Quitar favoritos y vistos.
   - MyTickets: tabs Activos/Usados/Expirados.
   - BottomNav: `px-3`, altura mayor, separación inferior, soporte 6 ítems, indicador activo.
   - Chatbot: z-index y offset cuando hay BottomNav, no tapa Tickets/Perfil.

4. **Seguridad/Antifraude**
   - `qr-service` (issue/refresh 30s, JWT firmado).
   - `validation-service` (scan + logs + duplicados).
   - Pantalla scanner para rol `scanner`.

5. **Pagos**
   - Integración Stripe (test mode) via tool de Lovable.

6. **Admin**
   - CRUD eventos, gestión usuarios (ver/editar/bloquear), validación de tickets, dashboard con métricas reales.

7. **A11y + performance**
   - Auditoría axe, lazy routes, virtualización admin, imágenes optimizadas.

---

## Decisiones que necesito confirmes antes de codear

1. **Alcance del primer sprint** — ¿hacemos las **7 épicas** en este turno (es mucho código, varias horas y muchos archivos), o priorizamos? Mi recomendación: **épicas 1, 2, 3 y 6 ahora**; 4 (QR dinámico) y 5 (Stripe) en el siguiente turno porque requieren tu intervención (Stripe form, scanner físico).
2. **Pasarela de pago** — ¿Stripe (recomendado) o PayPhone también?
3. **OAuth** — ¿activamos Google sign-in ahora?
4. **Email** — ¿conectamos Resend (necesito que actives la integración) o lo dejamos para después?
5. **Mapbox** — ¿lo integramos ya (necesito que me des una public token) o usamos placeholder visual de momento?
6. **Roles** — confirmo `admin | organizer | scanner | user`. ¿OK o sólo `admin | user`?
7. **Seed de eventos** — ¿migro los eventos actuales de `data.ts` tal cual a la BD o quieres un set nuevo?

Responde con tus elecciones (o "todo lo que recomiendes") y arranco la implementación.
