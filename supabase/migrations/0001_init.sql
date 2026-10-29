-- =====================================================================
-- Terra After School — CRM de extracurriculares
-- Esquema inicial (Supabase / PostgreSQL)
-- =====================================================================
-- Modelo:
--   * El PAPÁ es el LEAD. Se registra en el embudo de ventas. No se
--     requiere el nombre del niño hasta la clase muestra.
--   * Cuando el lead se convierte (paga inscripción) se genera el perfil
--     del/los NIÑO(S) en la tabla `alumnos` (un papá puede tener varios).
--   * Cada deporte en el que está inscrito un alumno vive en
--     `inscripciones`, con sus fechas de corte / mensualidad.
-- =====================================================================

-- Extensiones -----------------------------------------------------------
create extension if not exists "pgcrypto";

-- =====================================================================
-- Catálogo de deportes (editable por el equipo)
-- =====================================================================
create table if not exists public.deportes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.deportes (nombre) values
  ('Fútbol'), ('Taekwondo'), ('Danza'), ('Voleibol')
on conflict (nombre) do nothing;

-- =====================================================================
-- PADRES / LEADS  (el lead es el papá)
-- =====================================================================
-- etapa = etapa del embudo de ventas
--   nuevo             -> lead recién capturado
--   contactado        -> ya se le contactó
--   clase_muestra     -> clase muestra agendada
--   asistio_muestra   -> asistió a la clase muestra
--   inscrito          -> pagó inscripción (convertido a alumno)
--   perdido           -> no convirtió
create table if not exists public.padres (
  id                 uuid primary key default gen_random_uuid(),
  nombre             text not null,                      -- nombre del papá / tutor
  telefono           text,
  email              text,
  -- Clasificación: ¿el niño viene de fuera o es alumno de Terranova?
  tipo               text not null default 'externo'
                       check (tipo in ('externo','terranova')),
  -- ¿Cómo se enteró? (fuente del lead)
  fuente             text,
  -- Deporte de interés principal (Fútbol / Taekwondo / Danza / Voleibol)
  deporte_interes    text,
  -- Embudo de ventas
  etapa              text not null default 'nuevo'
                       check (etapa in ('nuevo','contactado','clase_muestra',
                                        'asistio_muestra','inscrito','perdido')),
  -- Nombre del/los niño(s): NO requerido como lead; se captura en clase muestra
  nombre_nino        text,
  -- Seguimiento de fechas del embudo
  fecha_clase_muestra date,
  fecha_inscripcion   date,
  -- Responsable del seguimiento (encargado, maestro, etc.)
  responsable        text,
  notas              text,
  motivo_perdida     text,                               -- si etapa = perdido
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_padres_etapa  on public.padres (etapa);
create index if not exists idx_padres_tipo   on public.padres (tipo);
create index if not exists idx_padres_deporte on public.padres (deporte_interes);

-- =====================================================================
-- ALUMNOS  (los niños = nuestros clientes). Se generan al convertir.
-- Un papá puede tener varios hijos.
-- =====================================================================
create table if not exists public.alumnos (
  id               uuid primary key default gen_random_uuid(),
  padre_id         uuid not null references public.padres (id) on delete cascade,
  nombre           text not null,
  fecha_nacimiento date,
  -- Hereda la clasificación pero se puede ajustar por alumno
  tipo             text not null default 'externo'
                     check (tipo in ('externo','terranova')),
  grado_terranova  text,                                 -- grado/grupo si es de Terranova
  notas            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_alumnos_padre on public.alumnos (padre_id);

-- =====================================================================
-- INSCRIPCIONES (a qué deportes está inscrito cada alumno)
-- Aquí vive el seguimiento de pagos / fechas de corte.
-- =====================================================================
create table if not exists public.inscripciones (
  id                      uuid primary key default gen_random_uuid(),
  alumno_id               uuid not null references public.alumnos (id) on delete cascade,
  deporte                 text not null,
  -- Fechas clave del cliente convertido
  fecha_clase_muestra     date,                          -- día que vino a la clase muestra
  fecha_inscripcion       date,                          -- día que se inscribió
  fecha_inicio_mensualidad date,                         -- día que empezó a pagar mensualidad
  dia_corte               int check (dia_corte between 1 and 31), -- día del mes de corte
  monto_mensualidad       numeric(10,2),
  monto_inscripcion       numeric(10,2),
  estado                  text not null default 'activo'
                            check (estado in ('activo','pausado','baja')),
  notas                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_inscripciones_alumno  on public.inscripciones (alumno_id);
create index if not exists idx_inscripciones_deporte on public.inscripciones (deporte);
create index if not exists idx_inscripciones_estado  on public.inscripciones (estado);

-- =====================================================================
-- updated_at automático
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_padres_updated on public.padres;
create trigger trg_padres_updated before update on public.padres
  for each row execute function public.set_updated_at();

drop trigger if exists trg_alumnos_updated on public.alumnos;
create trigger trg_alumnos_updated before update on public.alumnos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inscripciones_updated on public.inscripciones;
create trigger trg_inscripciones_updated before update on public.inscripciones
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Vista: resumen de alumnos inscritos con su próxima fecha de corte
-- =====================================================================
create or replace view public.v_inscripciones_detalle as
select
  i.id,
  i.alumno_id,
  a.nombre            as alumno_nombre,
  a.tipo              as alumno_tipo,
  p.id                as padre_id,
  p.nombre            as padre_nombre,
  p.telefono          as padre_telefono,
  p.email             as padre_email,
  i.deporte,
  i.fecha_clase_muestra,
  i.fecha_inscripcion,
  i.fecha_inicio_mensualidad,
  i.dia_corte,
  i.monto_mensualidad,
  i.estado,
  -- próxima fecha de corte calculada a partir del día de corte
  case
    when i.dia_corte is null then null
    when i.dia_corte >= extract(day from current_date)
      then make_date(
             extract(year  from current_date)::int,
             extract(month from current_date)::int,
             least(i.dia_corte,
                   extract(day from (date_trunc('month', current_date)
                            + interval '1 month - 1 day'))::int))
    else make_date(
           extract(year  from (current_date + interval '1 month'))::int,
           extract(month from (current_date + interval '1 month'))::int,
           least(i.dia_corte,
                 extract(day from (date_trunc('month', current_date + interval '1 month')
                          + interval '1 month - 1 day'))::int))
  end as proxima_fecha_corte
from public.inscripciones i
join public.alumnos a on a.id = i.alumno_id
join public.padres  p on p.id = a.padre_id;

-- =====================================================================
-- Row Level Security
-- v1: cualquier usuario autenticado del equipo tiene acceso completo.
-- (En la fase futura para papás se afinarán políticas por rol.)
-- =====================================================================
alter table public.deportes      enable row level security;
alter table public.padres        enable row level security;
alter table public.alumnos       enable row level security;
alter table public.inscripciones enable row level security;

drop policy if exists "equipo_lee_deportes" on public.deportes;
create policy "equipo_lee_deportes" on public.deportes
  for select to authenticated using (true);
drop policy if exists "equipo_admin_deportes" on public.deportes;
create policy "equipo_admin_deportes" on public.deportes
  for all to authenticated using (true) with check (true);

drop policy if exists "equipo_padres" on public.padres;
create policy "equipo_padres" on public.padres
  for all to authenticated using (true) with check (true);

drop policy if exists "equipo_alumnos" on public.alumnos;
create policy "equipo_alumnos" on public.alumnos
  for all to authenticated using (true) with check (true);

drop policy if exists "equipo_inscripciones" on public.inscripciones;
create policy "equipo_inscripciones" on public.inscripciones
  for all to authenticated using (true) with check (true);
