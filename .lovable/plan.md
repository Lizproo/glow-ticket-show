## Objetivo

Añadir autenticación real con dos roles (admin y usuario), rediseñar el chatbot con un estilo moderno (glassmorphism, avatar, animaciones, markdown) y montar el backend como microservicios usando **Edge Functions de Lovable Cloud** (cada función = un microservicio independiente).

> Nota: en Lovable Cloud no se usan contenedores tipo Docker. El equivalente a "microservicios" son las **Edge Functions** desplegadas de forma independiente, cada una con su propia responsabilidad y endpoint.

---

## 1. Backend (Lovable Cloud)

Activar Lovable Cloud y crear:

**Tablas**
- `profiles` (id, user_id → auth.users, full_name, avatar_url, phone, created_at)
- `user_roles` (id, user_id, role: enum `admin` | `user`) — tabla separada por seguridad
- `app_role` enum
- Función `has_role(user_id, role)` SECURITY DEFINER
- RLS en ambas tablas
- Trigger `handle_new_user` que crea profile automáticamente al registrarse
- Primer usuario registrado se promueve a `admin` automáticamente (o uno asignado por email semilla)

**Microservicios (Edge Functions)**
- `auth-service`: validar sesión, devolver perfil + rol
- `chatbot-service`: responde al chatbot usando Lovable AI Gateway (Gemini), con contexto de eventos
- `admin-service`: endpoints solo para admins (listar usuarios, estadísticas)

---

## 2. Login y registro (frontend)

- Nueva pantalla `AuthScreen` con tabs Iniciar sesión / Registrarse
- Email + contraseña (autoconfirm activado para pruebas rápidas)
- Hook `useAuth` (sesión, perfil, rol, signIn, signUp, signOut)
- Si no hay sesión → forzar AuthScreen tras el onboarding
- En `ProfileScreen`: botón "Cerrar sesión", mostrar badge de rol
- Si rol = admin → nuevo tab "Admin" en `BottomNav` con `AdminScreen` (lista de usuarios, total tickets, total eventos)

---

## 3. Chatbot rediseñado

- Burbuja flotante con gradiente glow + animación pulse
- Panel con glassmorphism, header con avatar animado "Glow Assistant"
- Mensajes con bubbles diferenciadas, timestamps, indicador "escribiendo..."
- Soporte markdown con `react-markdown`
- Llamadas a `chatbot-service` (IA real) en vez de respuestas hardcodeadas
- Quick replies sugeridos al abrir
- Animaciones de entrada de mensajes

---

## 4. Archivos

**Nuevos**
- `src/hooks/useAuth.tsx`
- `src/screens/AuthScreen.tsx`
- `src/screens/AdminScreen.tsx`
- `supabase/functions/chatbot-service/index.ts`
- `supabase/functions/admin-service/index.ts`
- Migración SQL: enum, tablas, RLS, trigger

**Editados**
- `src/pages/Index.tsx` (flujo: onboarding → auth → app, tab admin condicional)
- `src/components/Chatbot.tsx` (rediseño + integración IA)
- `src/components/BottomNav.tsx` (tab admin condicional)
- `src/screens/ProfileScreen.tsx` (rol + logout)
- `package.json` (react-markdown)

---

## 5. Cómo probar después

1. Registra el primer usuario → será admin automáticamente
2. Registra un segundo usuario → será usuario normal
3. Verás el tab "Admin" solo con la primera cuenta
4. Abre el chatbot y pregunta "¿qué conciertos hay?" — responde la IA real
