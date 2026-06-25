# PRD — AcademIA: Gestor de Tareas Académicas para Posgrado

**Versión:** 1.0 · **Fecha:** 2026-05-31 · **Autor:** PM Senior · **Estado:** Draft aprobado para desarrollo

---

## 1. Resumen Ejecutivo

AcademIA es una aplicación web SaaS que centraliza la gestión de cursos y tareas de estudiantes de maestría, proporcionando visibilidad inmediata de carga académica y prioridades. El MVP elimina la fragmentación entre hojas de cálculo, WhatsApp y calendarios físicos, entregando un sistema cohesionado en 8 semanas.

| Atributo | Valor |
|---|---|
| Stack | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Deploy | Vercel (Preview + Production) |
| Alcance MVP | Auth · Cursos · Tareas · Dashboard |
| Usuarios objetivo | Estudiantes de maestría presencial/híbrida |

---

## 2. Personas y Casos de Uso

### Persona Principal — "Sofía, estudiante activa"
- **Perfil:** 28 años, maestría en Gestión de Proyectos, 4 cursos simultáneos, trabaja medio tiempo.
- **Dolor:** Pierde entregables por no tener un sistema unificado; no sabe cuánta carga real tiene por semana.
- **Expectativa:** Ver de un vistazo qué vence esta semana, por curso, con prioridad clara.

### Persona Secundaria — "Diego, perfeccionista organizado"
- **Perfil:** 32 años, maestría en Ciencia de Datos, lleva todo en Notion pero quiere algo más enfocado.
- **Dolor:** Notion es demasiado genérico; mezcla trabajo y academia.
- **Expectativa:** Tablero limpio, métricas de avance y filtros rápidos por curso.

### Casos de Uso Clave

| ID | Actor | Caso de Uso |
|---|---|---|
| UC-01 | Sofía | Crear cuenta y acceder a la aplicación |
| UC-02 | Sofía | Registrar un nuevo curso con color identificador |
| UC-03 | Sofía | Agregar una tarea con fecha límite y prioridad |
| UC-04 | Diego | Cambiar estado de una tarea a "Completada" |
| UC-05 | Diego | Consultar el tablero de métricas semanales |
| UC-06 | Sofía | Editar o eliminar un curso existente |
| UC-07 | Diego | Filtrar tareas por curso o estado |

---

## 3. Historias de Usuario

### Módulo Auth
| ID | Historia | Criterio de aceptación resumido |
|---|---|---|
| US-01 | **Como** estudiante nuevo, **quiero** registrarme con correo y contraseña, **para** crear mi cuenta sin dependencia de terceros. | Registro exitoso redirige al dashboard; email de confirmación enviado. |
| US-02 | **Como** usuario registrado, **quiero** iniciar sesión con mis credenciales, **para** acceder a mis cursos y tareas. | Credenciales incorrectas muestran error claro; sesión persiste con refresh token. |
| US-03 | **Como** usuario autenticado, **quiero** cerrar sesión, **para** proteger mi información en dispositivos compartidos. | Cierra sesión y redirige a `/login`; token invalidado. |

### Módulo Cursos
| ID | Historia | Criterio de aceptación resumido |
|---|---|---|
| US-04 | **Como** estudiante, **quiero** crear un curso con nombre, código y color, **para** identificarlo visualmente en la app. | Formulario valida campos requeridos; curso aparece inmediatamente en la lista. |
| US-05 | **Como** estudiante, **quiero** editar un curso existente, **para** corregir datos ingresados incorrectamente. | Cambios persisten en DB y se reflejan en todas las tareas asociadas. |
| US-06 | **Como** estudiante, **quiero** eliminar un curso, **para** mantener activos solo los cursos del ciclo vigente. | Eliminar curso muestra confirmación; las tareas asociadas se eliminan en cascada. |

### Módulo Tareas
| ID | Historia | Criterio de aceptación resumido |
|---|---|---|
| US-07 | **Como** estudiante, **quiero** crear una tarea con título, descripción, prioridad (Alta/Media/Baja), fecha límite, estado y curso, **para** tener registro completo del entregable. | Todos los campos requeridos validados; tarea aparece en la lista filtrada por curso. |
| US-08 | **Como** estudiante, **quiero** cambiar el estado de una tarea (Pendiente → En progreso → Completada), **para** reflejar mi avance real. | Cambio de estado actualiza en tiempo real sin recargar página. |
| US-09 | **Como** estudiante, **quiero** filtrar tareas por curso, estado y prioridad, **para** enfocarme en lo urgente. | Filtros combinables; resultado vacío muestra estado vacío ilustrado. |
| US-10 | **Como** estudiante, **quiero** eliminar una tarea, **para** limpiar entregables cancelados. | Confirmación antes de eliminar; no afecta otras tareas del curso. |

### Módulo Dashboard
| ID | Historia | Criterio de aceptación resumido |
|---|---|---|
| US-11 | **Como** estudiante, **quiero** ver métricas de mis tareas (total, completadas, pendientes, vencidas), **para** evaluar mi desempeño académico. | Métricas se recalculan al cambiar estados; sin datos muestra onboarding. |
| US-12 | **Como** estudiante, **quiero** ver las próximas 5 tareas por vencer, **para** planificar mi semana. | Ordenadas por fecha ASC; distingue vencidas (resaltado rojo). |

---

## 4. Modelo de Datos

### 4.1 Diagrama Relacional (texto)

```
auth.users (Supabase)
    │
    └── profiles (1:1)
    │
    └── courses (1:N)
            │
            └── tasks (1:N)
```

### 4.2 SQL DDL Completo

```sql
-- ============================================================
-- PROFILES: extensión de auth.users
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: sincronizar nuevo usuario → perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  code        TEXT NOT NULL CHECK (char_length(code) BETWEEN 2 AND 20),
  color       TEXT NOT NULL DEFAULT '#6366f1'
                   CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, code)
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status   AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title        TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  description  TEXT,
  priority     task_priority NOT NULL DEFAULT 'medium',
  status       task_status   NOT NULL DEFAULT 'pending',
  due_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX idx_tasks_user_id    ON public.tasks(user_id);
CREATE INDEX idx_tasks_course_id  ON public.tasks(course_id);
CREATE INDEX idx_tasks_due_date   ON public.tasks(due_date);
CREATE INDEX idx_tasks_status     ON public.tasks(status);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## 5. Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- COURSES
-- ============================================================
CREATE POLICY "courses: select own"
  ON public.courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "courses: insert own"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "courses: update own"
  ON public.courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "courses: delete own"
  ON public.courses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TASKS
-- ============================================================
CREATE POLICY "tasks: select own"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tasks: insert own"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: update own"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "tasks: delete own"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 6. Wireframes Textuales por Pantalla

### 6.1 `/login` — Autenticación
```
┌─────────────────────────────────────────┐
│            AcademIA  🎓                  │
│   ──────────────────────────────────    │
│   [ Email _________________________ ]   │
│   [ Contraseña __________________ ]    │
│   [ Iniciar sesión  (btn primary)  ]   │
│                                         │
│   ¿No tienes cuenta? → Regístrate      │
└─────────────────────────────────────────┘
```

### 6.2 `/dashboard` — Tablero principal
```
┌──────────────────────────────────────────────────────────┐
│  AcademIA   [Cursos] [Tareas] [Dashboard]    [Avatar ▾]  │
├──────────────────────────────────────────────────────────┤
│  MÉTRICAS                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐   │
│  │  Total   │ │Completad.│ │ Pendient.│ │  Vencidas │   │
│  │   12     │ │    5     │ │    6     │ │     1     │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘   │
│                                                           │
│  PRÓXIMAS A VENCER                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔴 Alta  | Tesis cap. 3  | Estadística | 02 jun    │  │
│  │ 🟡 Media | Informe final | Finanzas    | 05 jun    │  │
│  │ 🟢 Baja  | Lectura 7     | Ética       | 10 jun    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 6.3 `/courses` — Gestión de cursos
```
┌──────────────────────────────────────────────────────────┐
│  Cursos                             [+ Nuevo curso]       │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐                          │
│  │ ● Estadística Avanzada      │  EST-501  ✏️  🗑️         │
│  └─────────────────────────────┘                          │
│  ┌─────────────────────────────┐                          │
│  │ ● Finanzas Corporativas     │  FIN-301  ✏️  🗑️         │
│  └─────────────────────────────┘                          │
│                                                           │
│  [Modal: Crear/Editar Curso]                              │
│  ┌──────────────────────────┐                             │
│  │  Nombre del curso  [___] │                             │
│  │  Código            [___] │                             │
│  │  Color             [🎨 ] │                             │
│  │  [Cancelar] [Guardar]    │                             │
│  └──────────────────────────┘                             │
└──────────────────────────────────────────────────────────┘
```

### 6.4 `/tasks` — Gestión de tareas
```
┌──────────────────────────────────────────────────────────┐
│  Tareas                             [+ Nueva tarea]       │
│  Filtros: [Curso ▾] [Estado ▾] [Prioridad ▾]             │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐    │
│  │ 🔴 Tesis capítulo 3   │ Pendiente  │ 02/06/2026  │    │
│  │    Estadística Avanzada (azul)      ✏️  🗑️        │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 🟡 Informe final      │ En progreso│ 05/06/2026  │    │
│  │    Finanzas (verde)                 ✏️  🗑️        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  [Drawer lateral: Crear/Editar Tarea]                     │
│  │ Título        [______________________]  │             │
│  │ Descripción   [______________________]  │             │
│  │ Curso         [Seleccionar ▾]           │             │
│  │ Prioridad     [Alta] [Media] [Baja]     │             │
│  │ Estado        [Pendiente ▾]             │             │
│  │ Fecha límite  [📅 picker]               │             │
│  │ [Cancelar]    [Guardar]                 │             │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Variables de Entorno

```bash
# .env.local — Next.js
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Solo para operaciones server-side (Route Handlers / Server Actions)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Vercel — Configurar también en dashboard del proyecto
# Las variables NEXT_PUBLIC_* son accesibles en cliente
# SUPABASE_SERVICE_ROLE_KEY solo en servidor (nunca exponer al cliente)
```

> **Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` omite RLS. Usarla únicamente en Server Actions o API Routes con validación previa de sesión. Nunca incluirla en bundles de cliente.

---

## 8. Criterios de Aceptación por Funcionalidad

### 8.1 Autenticación
- [ ] Registro con email/contraseña crea usuario en `auth.users` y perfil en `profiles`.
- [ ] Login exitoso redirige a `/dashboard`; fallo muestra mensaje de error no técnico.
- [ ] Rutas protegidas (`/dashboard`, `/courses`, `/tasks`) redirigen a `/login` si no hay sesión activa.
- [ ] Logout invalida la sesión y redirige a `/login`.
- [ ] Refresh token mantiene sesión activa sin re-login manual.

### 8.2 Gestión de Cursos
- [ ] Formulario valida: nombre (2–100 chars), código (2–20 chars), color (hex válido).
- [ ] Código de curso único por usuario (constraint DB + mensaje de error UX).
- [ ] Editar curso actualiza nombre/código/color en tiempo real en la lista.
- [ ] Eliminar curso muestra `AlertDialog` de confirmación; si tiene tareas, advierte que se desasociarán (`SET NULL`).
- [ ] Lista de cursos vacía muestra estado vacío con CTA "Crear primer curso".

### 8.3 Gestión de Tareas
- [ ] Formulario valida: título (2–200 chars), prioridad requerida, estado requerido.
- [ ] Tarea puede crearse sin curso asignado (course_id nullable).
- [ ] Cambio de estado actualiza `updated_at` y refleja badge correcto sin recarga.
- [ ] Filtros por curso, estado y prioridad son combinables y reseteables.
- [ ] Tareas con `due_date < TODAY` y `status != completed` se marcan visualmente como vencidas.

### 8.4 Dashboard
- [ ] Métricas calculadas en el servidor (Server Component) con datos al momento del request.
- [ ] Tarjetas de métricas: Total, Completadas, Pendientes + En progreso, Vencidas.
- [ ] "Próximas a vencer" lista máximo 5 tareas ordenadas por `due_date ASC` con `status != completed`.
- [ ] Sin datos (nuevo usuario), muestra pantalla de onboarding con pasos guiados.

### 8.5 RLS y Seguridad
- [ ] Usuario A no puede acceder a cursos/tareas de usuario B vía API directa a Supabase.
- [ ] Todas las mutaciones validan `auth.uid() = user_id` en la política correspondiente.
- [ ] Variables `NEXT_PUBLIC_*` no contienen secrets; `SERVICE_ROLE_KEY` solo en servidor.

---

## 9. Estructura de Proyecto Sugerida

```
academIA/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # Sidebar + Nav autenticado
│   │   ├── dashboard/page.tsx
│   │   ├── courses/page.tsx
│   │   └── tasks/page.tsx
│   └── layout.tsx              # Root layout + Providers
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── courses/                # CourseCard, CourseForm
│   └── tasks/                  # TaskRow, TaskDrawer, TaskFilters
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient
│   │   └── server.ts           # createServerClient (cookies)
│   └── utils.ts
├── types/
│   └── database.ts             # Tipos generados: supabase gen types
└── middleware.ts               # Protección de rutas con session check
```

---

*Documento listo para handoff a equipo de ingeniería. Próximo paso: kick-off técnico + setup de repositorio y proyecto Supabase.*
