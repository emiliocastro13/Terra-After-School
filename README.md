# Terra After School — CRM de extracurriculares

CRM para dar seguimiento a los leads de las clases extracurriculares del Colegio
Terranova (**Fútbol, Taekwondo, Danza, Voleibol**): embudo de ventas, conversión
de leads a alumnos inscritos y seguimiento de fechas de corte.

Mismo patrón que las otras apps: **Supabase** (base de datos + autenticación) +
**GitHub** + despliegue en **Vercel**. Front-end en **Vite + React + TypeScript + Tailwind**.

---

## 🧠 Cómo funciona el modelo

> El **papá es el lead** y el **niño es el cliente (alumno)**.

1. **Lead (papá)** — entra al **embudo de ventas**. Se clasifica como **externo**
   (viene de fuera del colegio) o **alumno de Terranova**. Como lead **no se
   necesita el nombre del niño**.
2. **Clase muestra** — al agendar/asistir ya se captura el **nombre del niño** y
   la **fecha de la clase muestra**.
3. **Conversión** — al **pagar la inscripción**, el lead se convierte: se genera
   el **perfil del niño** (un papá puede tener **varios hijos**) y su
   **inscripción** a un deporte, con fecha de inscripción, inicio de mensualidad
   y **día de corte**.
4. **Alumnos inscritos** — otra "base de datos" donde ves a qué deportes está
   inscrito cada niño y sus próximas fechas de corte.

### Etapas del embudo
`Nuevo → Contactado → Clase muestra agendada → Asistió a clase muestra → Inscrito`
(más `Perdido` para los que no convierten).

### Tablas
| Tabla | Qué guarda |
|-------|------------|
| `padres` | Leads (papás): datos de contacto, clasificación, fuente, etapa del embudo, deporte de interés, fechas de muestra/inscripción. |
| `alumnos` | Perfiles de los niños (se generan al convertir). `padre_id` → varios hijos por papá. |
| `inscripciones` | Deporte de cada alumno + fechas de muestra, inscripción, inicio de mensualidad, **día de corte**, montos y estado. |
| `deportes` | Catálogo editable de deportes. |
| `v_inscripciones_detalle` | Vista que une todo y **calcula la próxima fecha de corte**. |

---

## 🚀 Puesta en marcha

### 1. Crear el proyecto en Supabase
1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. En el **SQL Editor**, pega y ejecuta el contenido de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Esto crea las tablas, la vista, los triggers y las políticas de seguridad (RLS).
3. En **Project Settings → API** copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Crear usuarios del equipo
En **Authentication → Users → Add user**, crea las cuentas (correo + contraseña)
para ti, el encargado de extracurriculares y los maestros de cada deporte.
> En esta primera fase cualquier usuario autenticado tiene acceso completo.
> La fase para papás (solo-lectura de su información) se afinará después con roles.

### 3. Correr en local
```bash
cp .env.example .env.local   # y rellena tus llaves de Supabase
npm install
npm run dev
```
Abre http://localhost:5173

### 4. Desplegar en Vercel
1. Importa el repo en [vercel.com](https://vercel.com) (framework detectado: **Vite**).
2. En **Settings → Environment Variables** agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy**. El archivo [`vercel.json`](vercel.json) ya maneja el enrutado SPA.

---

## 📂 Estructura
```
supabase/migrations/0001_init.sql   Esquema de la base de datos
src/
  lib/            cliente supabase, tipos, constantes, utilidades
  context/        AuthContext (sesión de Supabase)
  components/     Layout, UI, LeadModal, ConvertirModal
  pages/          Login, Dashboard, Embudo, Alumnos
```

## 🗺️ Próximas fases (ideas)
- Portal para papás (ver su info, noticias, anuncios, fechas de corte).
- Roles por maestro (ver solo su deporte).
- Registro de pagos mensuales y recordatorios automáticos de corte.
- Varios deportes de interés por lead.
