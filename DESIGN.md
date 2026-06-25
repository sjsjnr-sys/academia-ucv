# DESIGN.md — AcademIA Visual Source of Truth

> **Versión:** 1.0 · **Fecha:** 2026-05-31
> Este documento es la fuente de verdad visual de AcademIA. Cualquier decisión de diseño no cubierta aquí debe resolverse siguiendo los principios de esta guía, no la intuición personal del implementador.
> Compatible con: **Stitch MCP**, **Antigravity**, **shadcn/ui**, **Tailwind CSS v4**.

---

## 0. Filosofía de Diseño

AcademIA vive en la intersección entre **rigor académico y claridad operacional**. La estética referencia a Notion (estructura editorial, densidad de información cómoda) y Linear (velocidad percibida, detalles de precisión, jerarquía despiadada). El resultado no es una herramienta corporativa ni una app de estudiante: es una **herramienta de producción personal** para personas inteligentes bajo presión de tiempo.

### Principios rectores

| Principio | Descripción |
|---|---|
| **Claridad primero** | Cada elemento en pantalla debe justificar su existencia. Si no ayuda a tomar una decisión, se elimina. |
| **Velocidad percibida** | Micro-transiciones de 150–200 ms. Sin spinners donde pueda haber skeletons. Sin modales donde pueda haber drawers in-place. |
| **Densidad cómoda** | Suficiente información por pantalla para ser productivo. No tan poco que parezca vacío. No tan lleno que genere ansiedad. |
| **Confianza silenciosa** | Confirmaciones de acciones, estados de error descriptivos, feedback inmediato. La app nunca deja al usuario adivinando. |
| **Modo oscuro primero** | Dark mode es el modo canónico de diseño. Light mode es derivado, no un afterthought. |

---

## 1. Paleta de Colores

### 1.1 Variables CSS — Sistema de tokens

```css
/* globals.css — usar en :root y .dark */

:root {
  /* ── Fondos ── */
  --bg-base:        #F7F7F5;   /* Blanco roto cálido, no blanco puro */
  --bg-elevated:    #FFFFFF;   /* Cards, modales, drawers */
  --bg-sunken:      #EFEFEC;   /* Inputs, áreas de código inline */
  --bg-overlay:     rgba(0, 0, 0, 0.45); /* Backdrops de modal */

  /* ── Primario: Slate Índigo ── */
  --primary-50:     #EEF0FF;
  --primary-100:    #D9DDFF;
  --primary-200:    #B5BCFF;
  --primary-300:    #8B94FF;
  --primary-400:    #6B75FA;
  --primary-500:    #4F5BF5;   /* Brand principal */
  --primary-600:    #3B46D4;
  --primary-700:    #2D37A8;
  --primary-800:    #222A80;
  --primary-900:    #181E5C;

  /* ── Secundario: Slate neutro ── */
  --neutral-50:     #F8F8F7;
  --neutral-100:    #EEEEED;
  --neutral-200:    #DEDDDB;
  --neutral-300:    #C5C4C1;
  --neutral-400:    #9E9D9A;
  --neutral-500:    #737270;
  --neutral-600:    #545351;
  --neutral-700:    #3A3937;
  --neutral-800:    #242322;
  --neutral-900:    #151514;

  /* ── Acento: Ámbar tostado ── */
  --accent-300:     #FFD88A;
  --accent-400:     #FFC043;
  --accent-500:     #F59B00;   /* Acento principal */
  --accent-600:     #C97B00;

  /* ── Semáforo de prioridad ── */
  --priority-high:        #EF4444;   /* Rojo — Alta */
  --priority-high-bg:     #FEF2F2;
  --priority-high-border: #FECACA;

  --priority-medium:        #F59E0B;   /* Ámbar — Media */
  --priority-medium-bg:     #FFFBEB;
  --priority-medium-border: #FDE68A;

  --priority-low:        #22C55E;   /* Verde — Baja */
  --priority-low-bg:     #F0FDF4;
  --priority-low-border: #BBF7D0;

  /* ── Estados funcionales ── */
  --success:      #16A34A;
  --success-bg:   #DCFCE7;
  --warning:      #D97706;
  --warning-bg:   #FEF3C7;
  --error:        #DC2626;
  --error-bg:     #FEE2E2;
  --info:         #2563EB;
  --info-bg:      #DBEAFE;

  /* ── Texto ── */
  --text-primary:   #1A1917;
  --text-secondary: #545351;
  --text-tertiary:  #9E9D9A;
  --text-disabled:  #C5C4C1;
  --text-inverse:   #FFFFFF;
  --text-on-primary:#FFFFFF;

  /* ── Bordes ── */
  --border-subtle:  #EEEEED;
  --border-default: #DEDDDB;
  --border-strong:  #9E9D9A;
  --border-focus:   #4F5BF5;   /* = primary-500 */

  /* ── Sombras ── */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04);
}

/* ── MODO OSCURO ── */
.dark {
  --bg-base:        #111110;
  --bg-elevated:    #1A1917;
  --bg-sunken:      #0D0D0C;
  --bg-overlay:     rgba(0, 0, 0, 0.65);

  --primary-500:    #6B75FA;   /* Ligeramente más brillante en dark */

  --neutral-100:    #242322;
  --neutral-200:    #3A3937;
  --neutral-300:    #545351;
  --neutral-700:    #DEDDDB;
  --neutral-800:    #EEEEED;
  --neutral-900:    #F8F8F7;

  --text-primary:   #F0EFEC;
  --text-secondary: #ADACA9;
  --text-tertiary:  #737270;
  --text-disabled:  #545351;

  --border-subtle:  #242322;
  --border-default: #3A3937;
  --border-strong:  #545351;

  --priority-high-bg:     #2D0A0A;
  --priority-high-border: #7F1D1D;
  --priority-medium-bg:   #2D1D00;
  --priority-medium-border:#78350F;
  --priority-low-bg:      #052E16;
  --priority-low-border:  #14532D;

  --success-bg:   #052E16;
  --warning-bg:   #2D1D00;
  --error-bg:     #2D0A0A;
  --info-bg:      #0D1F4E;

  --shadow-xs: 0 1px 2px rgba(0,0,0,0.30);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.30);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.30);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.50), 0 4px 6px rgba(0,0,0,0.30);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.60), 0 8px 10px rgba(0,0,0,0.30);
}
```

### 1.2 Paleta de colores para cursos

Los cursos tienen un color identificador elegido por el usuario. Proveer estos 12 presets como opciones en el color picker:

```ts
// lib/course-colors.ts
export const COURSE_COLOR_PRESETS = [
  { label: "Índigo",    value: "#4F5BF5" },
  { label: "Violeta",   value: "#7C3AED" },
  { label: "Rosa",      value: "#DB2777" },
  { label: "Rojo",      value: "#DC2626" },
  { label: "Naranja",   value: "#EA580C" },
  { label: "Ámbar",     value: "#D97706" },
  { label: "Lima",      value: "#65A30D" },
  { label: "Esmeralda", value: "#059669" },
  { label: "Cian",      value: "#0891B2" },
  { label: "Azul",      value: "#2563EB" },
  { label: "Slate",     value: "#475569" },
  { label: "Piedra",    value: "#78716C" },
] as const;
```

---

## 2. Tipografía

### 2.1 Familias

| Rol | Fuente | Import |
|---|---|---|
| **Display / Headlines** | `DM Serif Display` | Google Fonts |
| **UI / Body / Labels** | `Geist` | `next/font/local` (Vercel) |
| **Monospace / Código** | `Geist Mono` | `next/font/local` (Vercel) |

```tsx
// app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { DM_Serif_Display } from 'next/font/google';

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable} ${dmSerif.variable}`}>
      ...
    </html>
  );
}
```

```css
/* En globals.css */
--font-sans:    var(--font-geist-sans), 'Geist', system-ui, sans-serif;
--font-display: var(--font-display), 'DM Serif Display', Georgia, serif;
--font-mono:    var(--font-geist-mono), 'Geist Mono', monospace;
```

### 2.2 Escala tipográfica — Mobile first

```css
/* Tailwind custom fontSize — tailwind.config.ts */
fontSize: {
  'xs':   ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.01em'  }],  /* 12px */
  'sm':   ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],  /* 14px */
  'base': ['1rem',     { lineHeight: '1.5rem',  letterSpacing: '0'       }],  /* 16px */
  'lg':   ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],  /* 18px */
  'xl':   ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],  /* 20px */
  '2xl':  ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.02em' }],  /* 24px */
  '3xl':  ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],  /* 30px */
  '4xl':  ['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.03em' }],  /* 36px */
}
```

### 2.3 Estilos semánticos de texto

| Token | Font | Size mobile | Size desktop | Weight | Color |
|---|---|---|---|---|---|
| `heading-xl` | Display | `2xl` | `4xl` | 400 | text-primary |
| `heading-lg` | Display | `xl` | `3xl` | 400 | text-primary |
| `heading-md` | Sans | `lg` | `2xl` | 600 | text-primary |
| `heading-sm` | Sans | `base` | `lg` | 600 | text-primary |
| `body-lg` | Sans | `base` | `lg` | 400 | text-primary |
| `body-base` | Sans | `sm` | `base` | 400 | text-primary |
| `body-sm` | Sans | `xs` | `sm` | 400 | text-secondary |
| `label` | Sans | `xs` | `xs` | 500 | text-secondary |
| `caption` | Sans | `xs` | `xs` | 400 | text-tertiary |
| `code` | Mono | `sm` | `sm` | 400 | text-primary |

### 2.4 Uso correcto

```
✅ DO
  - DM Serif Display solo en page titles, hero sections y headings de sección vacía
  - Geist para todo lo interactivo: labels, botones, inputs, navegación
  - Tracking negativo en headings grandes (ya incluido en escala)

❌ DON'T
  - No usar Display font en botones ni labels de navegación
  - No usar font-size menor a 12px en ningún contexto
  - No mezclar pesos intermedios (500) en Display font
```

---

## 3. Sistema de Espaciado

Base: **4 px**. Todos los valores de spacing son múltiplos de 4.

```
4px  →  space-1  →  padding interno mínimo, gap entre icon y label
8px  →  space-2  →  padding de badge/chip, gap entre elementos inline
12px →  space-3  →  padding de input (vertical), gap entre form fields pequeños
16px →  space-4  →  padding de card (sm), gap estándar entre componentes
20px →  space-5  →  padding de card (md)
24px →  space-6  →  padding de sección, gap entre cards
32px →  space-8  →  padding de contenedor principal (mobile)
40px →  space-10 →  separación entre secciones
48px →  space-12 →  padding de contenedor principal (desktop)
64px →  space-16 →  margen entre secciones grandes
```

### 3.1 Bordes redondeados

```
rounded-sm:  4px   → Badges, chips pequeños
rounded:     6px   → Inputs, botones pequeños
rounded-md:  8px   → Botones estándar, dropdowns
rounded-lg:  12px  → Cards
rounded-xl:  16px  → Modales, drawers
rounded-2xl: 20px  → Toasts, sidebars
rounded-full:9999px→ Avatares, color dots, pill badges
```

---

## 4. Componentes de UI

Todos los componentes extienden shadcn/ui con las variantes definidas aquí. Los tokens CSS del §1 son la fuente de estilos; no usar colores hardcodeados.

---

### 4.1 Button

```tsx
// Variantes:
// primary | secondary | ghost | destructive | outline

// Tamaños: sm | md (default) | lg | icon

// Anatomía:
// [icon-left?] [label] [icon-right?]
// height sm: 32px | md: 36px | lg: 40px
// padding horizontal: sm: 12px | md: 16px | lg: 20px
// font: Geist, 14px/500

// Estados:
// default → hover (bg -1 step) → active (bg -2 steps, scale 0.98)
// focus-visible → ring 2px primary-500 offset 2px
// disabled → opacity-50, cursor-not-allowed
// loading → spinner 16px replace icon-left, pointer-events-none

// primary
bg: primary-500  text: white  hover-bg: primary-600
// secondary
bg: neutral-100  text: text-primary  hover-bg: neutral-200  border: border-default
// ghost
bg: transparent  text: text-secondary  hover-bg: bg-sunken
// destructive
bg: error        text: white   hover-bg: #B91C1C
// outline
bg: transparent  text: primary-500  border: primary-500  hover-bg: primary-50
```

### 4.2 Card

```tsx
// Variantes: default | interactive | flat

// default
bg: bg-elevated
border: 1px solid border-subtle
border-radius: rounded-lg (12px)
padding: space-5 (20px)
shadow: shadow-sm

// interactive (clickable, hoverable)
+ hover: shadow-md, border-color: border-default
+ transition: all 150ms ease

// flat (para listas densas)
bg: transparent
border: none
border-bottom: 1px solid border-subtle
border-radius: 0
padding: space-4 (16px) space-0

// Slots:
// <CardHeader> — título + acciones opcionales (top-right)
// <CardBody>   — contenido principal
// <CardFooter> — acciones o metadatos secundarios
```

### 4.3 Modal / Dialog

```tsx
// Basado en shadcn Dialog → Radix UI Dialog

// Overlay: bg-overlay, backdrop-blur-sm
// Panel:
//   bg: bg-elevated
//   border: 1px solid border-default
//   border-radius: rounded-xl (16px)
//   shadow: shadow-xl
//   padding: space-6 (24px)
//   max-width: 480px (sm) | 640px (md) | 768px (lg)
//   width: calc(100vw - 32px) en mobile

// Animación entrada:
//   overlay: fade-in 200ms
//   panel: fade-in + slide-up (translateY 8px → 0) 200ms ease-out

// Animación salida:
//   overlay + panel: fade-out 150ms ease-in

// Estructura:
// <DialogHeader>  → título (heading-sm) + descripción opcional (body-sm text-secondary)
// <DialogBody>    → contenido del form o mensaje
// <DialogFooter>  → alineación derecha: [Cancel ghost] [Confirm primary]

// Confirmación destructiva:
// Confirm button → variante destructive
// Icono ⚠️ AlertTriangle (Lucide) en header
```

### 4.4 Drawer (Side Panel)

```tsx
// Usado para crear/editar tareas (lado derecho en desktop, bottom sheet en mobile)

// Desktop (≥ 768px):
//   position: fixed right-0 top-0
//   width: 420px
//   height: 100vh
//   bg: bg-elevated
//   border-left: 1px solid border-default
//   shadow: shadow-xl
//   padding: space-6
//   animación: slide-in-right 250ms ease-out

// Mobile (< 768px):
//   position: fixed bottom-0 left-0 right-0
//   height: 90dvh
//   border-radius: rounded-xl rounded-b-none
//   animación: slide-up 300ms ease-out
//   handle bar: 32x4px, bg-neutral-300, rounded-full, centrado top-3
```

### 4.5 Toast / Notification

```tsx
// Posición: bottom-right (desktop) | bottom-center (mobile)
// Duración default: 4000ms
// Stack máximo: 3 toasts visibles

// Anatomía:
// [icon 16px] [mensaje body-sm] [acción opcional text-sm primary] [X]
// height: 48px mínimo (auto si texto largo)
// border-radius: rounded-2xl (20px)
// shadow: shadow-lg

// Variantes:
// success → bg: success-bg, border-l: 3px success, icon: CheckCircle
// error   → bg: error-bg,   border-l: 3px error,   icon: XCircle
// warning → bg: warning-bg, border-l: 3px warning,  icon: AlertTriangle
// info    → bg: info-bg,    border-l: 3px info,     icon: Info

// Animación: slide-up + fade-in 200ms; dismiss: fade-out + slide-down 150ms
// Librería: sonner (compatible con Next.js App Router)
```

### 4.6 Sidebar / Navigation

```tsx
// Layout principal: sidebar fijo izquierdo (desktop) / bottom nav (mobile)

// Desktop sidebar:
//   width: 240px (expanded) | 56px (collapsed)
//   bg: bg-elevated
//   border-right: 1px solid border-subtle
//   padding: space-4
//   transition: width 200ms ease

// Estructura:
// ┌─ Logo + wordmark (24px height)
// ├─ Nav items (primary)
// │   Dashboard  /dashboard
// │   Cursos     /courses
// │   Tareas     /tasks
// ├─ ─── separator ───
// └─ User avatar + name + logout (bottom)

// NavItem anatomy:
//   height: 36px
//   border-radius: rounded-md (8px)
//   padding: 0 space-3
//   gap icon-label: space-2
//   icon: 18px Lucide
//   font: body-sm 500

//   default:  text-secondary, bg-transparent
//   hover:    text-primary, bg-sunken
//   active:   text-primary, bg-primary-50 (light) / bg-primary-900/30 (dark),
//             text-primary-600 (light) / text-primary-300 (dark)

// Mobile bottom nav:
//   position: fixed bottom-0
//   height: 56px (+ safe-area-inset-bottom)
//   bg: bg-elevated / backdrop-blur-md
//   border-top: 1px solid border-subtle
//   items: 3 (Dashboard, Cursos, Tareas)
//   icon: 22px, label: 10px caption
```

### 4.7 Badge / Chip

```tsx
// Usado para: estado de tarea, prioridad, código de curso

// Anatomía: [dot 6px?] [label xs 500]
// height: 20px
// padding: 2px 8px
// border-radius: rounded-full

// Prioridad:
// alta   → bg: priority-high-bg,   text: priority-high,   border: priority-high-border
// media  → bg: priority-medium-bg, text: priority-medium,  border: priority-medium-border
// baja   → bg: priority-low-bg,    text: priority-low,    border: priority-low-border

// Estado de tarea:
// pending     → bg: neutral-100,  text: neutral-600,  "Pendiente"
// in_progress → bg: info-bg,      text: info,         "En progreso"
// completed   → bg: success-bg,   text: success,      "Completada"
```

### 4.8 Input / Form fields

```tsx
// Input base:
//   height: 36px
//   border-radius: rounded-md (8px)
//   border: 1px solid border-default
//   bg: bg-sunken
//   padding: 0 space-3
//   font: body-base Geist
//   color: text-primary
//   placeholder: text-tertiary

// Estados:
//   hover:  border-color: border-strong
//   focus:  border-color: border-focus (primary-500), ring: 0 0 0 3px primary-500/20
//   error:  border-color: error, ring: 0 0 0 3px error/20
//   disabled: bg: neutral-100, text: text-disabled, cursor: not-allowed

// Label: xs 500 text-secondary, margin-bottom: space-1
// Helper text: xs text-tertiary, margin-top: space-1
// Error text: xs text-error, margin-top: space-1, icon: XCircle 12px

// Select → mismo estilo que Input + ChevronDown icon derecha
// Textarea → min-height: 80px, resize: vertical
// DatePicker → Input + CalendarDays icon derecha + Popover calendar
```

### 4.9 Color Dot Picker (cursos)

```tsx
// Grid 4x3 de círculos de 24px
// Presets del §1.2
// Selected: ring-2 ring-offset-2 ring-[color]
// hover: scale(1.1) 150ms
```

---

## 5. Iconografía

**Librería:** `lucide-react` · **Tamaños estándar:** 14 / 16 / 18 / 20 / 24 px

```tsx
// Regla de tamaño:
// Inline en texto   → 14–16px (strokeWidth 1.75)
// Botones y labels  → 16–18px (strokeWidth 1.75)
// Nav sidebar       → 18–20px (strokeWidth 1.75)
// Empty states      → 40–48px (strokeWidth 1.25)
// strokeWidth default: 1.75 (más refinado que el default 2)
```

### Mapa de iconos por contexto

| Contexto | Icono Lucide |
|---|---|
| Dashboard / home | `LayoutDashboard` |
| Cursos | `BookOpen` |
| Tareas | `CheckSquare` |
| Nueva tarea | `Plus` o `PlusCircle` |
| Editar | `Pencil` |
| Eliminar | `Trash2` |
| Prioridad Alta | `ArrowUp` (rojo) |
| Prioridad Media | `ArrowRight` (ámbar) |
| Prioridad Baja | `ArrowDown` (verde) |
| Estado pendiente | `Circle` |
| Estado en progreso | `Clock` |
| Estado completado | `CheckCircle2` |
| Vencida / alerta | `AlertCircle` |
| Fecha límite | `CalendarDays` |
| Cerrar / dismiss | `X` |
| Logout | `LogOut` |
| Usuario | `User` o `UserCircle` |
| Búsqueda | `Search` |
| Filtros | `SlidersHorizontal` |
| Vacío – cursos | `BookDashed` |
| Vacío – tareas | `ClipboardList` |
| Éxito | `CheckCircle` |
| Error | `XCircle` |
| Advertencia | `AlertTriangle` |
| Info | `Info` |

---

## 6. Estados de UI

### 6.1 Estado de carga

```tsx
// Regla: NUNCA spinner de página completa. Siempre skeleton en el lugar del contenido.

// Skeleton base:
//   bg: neutral-200 (light) / neutral-700 (dark)
//   border-radius: igual al elemento que reemplaza
//   animación: shimmer — gradiente linear que se desplaza horizontalmente 1.5s infinite

// Skeletons específicos:
// MetricCard  → rect 100% x 80px rounded-lg
// TaskRow     → rect 100% x 56px rounded-md
// CourseCard  → rect 100% x 72px rounded-lg
// Sidebar nav → 3 rects 160px x 32px rounded-md, gap: space-2

// Botones en loading state:
//   Spinner 16px (Loader2 Lucide, animation-spin)
//   replace icon-left si existe, si no → prepend
//   pointer-events: none
```

### 6.2 Estado vacío

```tsx
// Anatomía del empty state:
// [Icono 48px text-tertiary]
// [Título heading-sm text-primary]
// [Descripción body-sm text-tertiary, max-width: 280px, text-center]
// [CTA Button primary, opcional]

// Textos por pantalla:
// Cursos vacíos:
//   icon: BookDashed
//   title: "Sin cursos todavía"
//   desc: "Agrega tu primer curso para empezar a organizar tus tareas."
//   cta: "Crear curso"

// Tareas vacías (sin filtros):
//   icon: ClipboardList
//   title: "No hay tareas aún"
//   desc: "Crea tu primera tarea y asígnala a un curso."
//   cta: "Nueva tarea"

// Tareas vacías (con filtros activos):
//   icon: SearchX
//   title: "Sin resultados"
//   desc: "Ninguna tarea coincide con los filtros seleccionados."
//   cta: "Limpiar filtros" (variante ghost)
```

### 6.3 Estado de error

```tsx
// Error de fetch / red:
//   icon: WifiOff 40px text-error
//   title: "Algo salió mal"
//   desc: "No pudimos cargar tu información. Verifica tu conexión."
//   cta: "Reintentar" (variante outline)

// Error de formulario (field-level):
//   mensaje debajo del input, text-error xs, icono XCircle 12px inline

// Error 404:
//   icon: MapPin (tachado o roto) 48px
//   title: "Página no encontrada"
//   cta: "Volver al dashboard"

// Error 500 / inesperado:
//   title: "Error inesperado"
//   desc: "Registramos el problema. Intenta de nuevo en unos momentos."
//   cta: "Recargar"
```

### 6.4 Estado de confirmación destructiva

```tsx
// Siempre usar AlertDialog (Radix), nunca window.confirm()
// Texto del botón de confirmación: acción específica (ej. "Eliminar curso") no genérico "Sí"
// Botón: variante destructive
// Botón cancelar: variante ghost, primero en el tab order
```

---

## 7. Animaciones y Motion

```css
/* Duraciones base */
--duration-instant:  0ms;      /* cambios de estado sin percepción visual */
--duration-fast:     100ms;    /* hover states, focus rings */
--duration-normal:   200ms;    /* aparición de elementos, modales pequeños */
--duration-moderate: 300ms;    /* drawers, side panels */
--duration-slow:     400ms;    /* transiciones de página */

/* Easings */
--ease-out:   cubic-bezier(0.0, 0.0, 0.2, 1.0);  /* entrada de elementos */
--ease-in:    cubic-bezier(0.4, 0.0, 1.0, 1.0);  /* salida de elementos */
--ease-inout: cubic-bezier(0.4, 0.0, 0.2, 1.0);  /* transiciones bidireccionales */
--ease-spring:cubic-bezier(0.34, 1.56, 0.64, 1); /* micro-interacciones con rebote */
```

### Reglas de motion

```
✅ DO
  - fade-in + slide-up (8px) para aparición de cards y modales
  - fade-in para overlays / backdrops
  - scale(0.98 → 1.00) en button:active
  - Stagger de 40ms entre items de lista en carga inicial
  - Task completada → tachado + opacity 0.5 con transición 200ms

❌ DON'T
  - No animar layout shifts (width/height de contenedores)
  - No usar ease-in para entradas (siempre ease-out)
  - No superar 400ms en ninguna animación de UI
  - No animar color de texto en hover (solo fondo/borde)
  - Respetar prefers-reduced-motion: usar @media (prefers-reduced-motion: reduce)
```

---

## 8. Responsive Breakpoints

```ts
// tailwind.config.ts — screens
screens: {
  'sm':  '480px',   // Mobile landscape
  'md':  '768px',   // Tablet / sidebar aparece
  'lg':  '1024px',  // Desktop estándar
  'xl':  '1280px',  // Desktop wide
}

// Layout strategy:
// < 768px  → bottom navigation, drawers como bottom sheets, 1 columna
// ≥ 768px  → sidebar 240px + main content, drawers laterales, 2+ columnas
// ≥ 1280px → sidebar + main con max-width 1200px centrado
```

---

## 9. Accesibilidad

```
- Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande y UI components (WCAG 2.1 AA)
- Focus visible: nunca eliminar outline; usar el ring definido en §4.8
- Todos los iconos puramente decorativos: aria-hidden="true"
- Iconos con significado semántico: aria-label o <title> SVG
- Modales: focus trap, Escape para cerrar, aria-modal="true"
- Toasts: role="alert" aria-live="polite" (success/info) | aria-live="assertive" (error)
- Inputs: siempre asociados a <label> con htmlFor o aria-label
- Tablas de datos: th scope="col/row", caption descriptivo
- Color no es el único diferenciador: badges incluyen texto además del color
- Prioridad: no solo color, incluir texto (Alta / Media / Baja) + icono
```

---

## 10. Guía de Implementación para Stitch MCP / Antigravity

```yaml
# Metadatos de handoff para herramientas de generación de código

design_system:
  name: "AcademIA"
  version: "1.0"
  framework: "Next.js 15 + Tailwind CSS v4 + shadcn/ui"
  font_primary: "Geist Sans"
  font_display: "DM Serif Display"
  font_mono: "Geist Mono"
  color_mode: "dark-first, light-supported"
  spacing_unit: 4  # px

component_library: "shadcn/ui"
icon_library: "lucide-react"
animation_library: "tailwindcss-animate + CSS native"
toast_library: "sonner"

token_prefix: "--"
dark_mode_strategy: "class"  # .dark en <html>

generate_components:
  - Button (variants: primary, secondary, ghost, destructive, outline; sizes: sm, md, lg, icon)
  - Card (variants: default, interactive, flat)
  - Modal (sizes: sm 480px, md 640px)
  - Drawer (desktop: right panel; mobile: bottom sheet)
  - Toast (variants: success, error, warning, info)
  - Sidebar (desktop: 240px fixed; mobile: bottom nav 56px)
  - Badge (contexts: priority, status)
  - Input (types: text, select, textarea, date)
  - ColorDotPicker (12 presets)

accessibility_level: "WCAG 2.1 AA"
```

---

*DESIGN.md generado para AcademIA v1.0 — Revisión cada sprint. Cambios deben ser aprobados por diseño antes de implementar.*
