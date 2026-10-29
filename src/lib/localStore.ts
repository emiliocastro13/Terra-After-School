// Backend de datos en el navegador (localStorage) para el MODO LOCAL.
// Replica lo que hará Supabase, para construir/probar sin base de datos en la nube.
import type { Alumno, Inscripcion, InscripcionDetalle, Padre } from './types'
import { proximaFechaCorte } from './format'

const K = {
  padres: 'as_padres',
  alumnos: 'as_alumnos',
  inscripciones: 'as_inscripciones',
  seed: 'as_seed_v1',
}

function read<T>(k: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]') as T[]
  } catch {
    return []
  }
}
function write<T>(k: string, v: T[]) {
  localStorage.setItem(k, JSON.stringify(v))
}
function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
function now(): string {
  return new Date().toISOString()
}

// ---- Padres ----------------------------------------------------------
export function listPadres(): Padre[] {
  return read<Padre>(K.padres).sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
}

export function createPadre(p: Partial<Padre>): Padre {
  const padres = read<Padre>(K.padres)
  const nuevo: Padre = {
    id: uuid(),
    nombre: p.nombre ?? '',
    telefono: p.telefono ?? null,
    email: p.email ?? null,
    tipo: p.tipo ?? 'externo',
    fuente: p.fuente ?? null,
    deporte_interes: p.deporte_interes ?? null,
    etapa: p.etapa ?? 'nuevo',
    nombre_nino: p.nombre_nino ?? null,
    fecha_clase_muestra: p.fecha_clase_muestra ?? null,
    fecha_inscripcion: p.fecha_inscripcion ?? null,
    responsable: p.responsable ?? null,
    notas: p.notas ?? null,
    motivo_perdida: p.motivo_perdida ?? null,
    created_at: now(),
    updated_at: now(),
  }
  padres.push(nuevo)
  write(K.padres, padres)
  return nuevo
}

export function updatePadre(id: string, patch: Partial<Padre>): void {
  const padres = read<Padre>(K.padres).map((p) =>
    p.id === id ? { ...p, ...patch, updated_at: now() } : p,
  )
  write(K.padres, padres)
}

// ---- Alumnos ---------------------------------------------------------
export function createAlumno(a: Partial<Alumno>): Alumno {
  const alumnos = read<Alumno>(K.alumnos)
  const nuevo: Alumno = {
    id: uuid(),
    padre_id: a.padre_id!,
    nombre: a.nombre ?? '',
    fecha_nacimiento: a.fecha_nacimiento ?? null,
    tipo: a.tipo ?? 'externo',
    grado_terranova: a.grado_terranova ?? null,
    notas: a.notas ?? null,
    created_at: now(),
    updated_at: now(),
  }
  alumnos.push(nuevo)
  write(K.alumnos, alumnos)
  return nuevo
}

// ---- Inscripciones ---------------------------------------------------
export function createInscripcion(i: Partial<Inscripcion>): Inscripcion {
  const insc = read<Inscripcion>(K.inscripciones)
  const nueva: Inscripcion = {
    id: uuid(),
    alumno_id: i.alumno_id!,
    deporte: i.deporte ?? '',
    fecha_clase_muestra: i.fecha_clase_muestra ?? null,
    fecha_inscripcion: i.fecha_inscripcion ?? null,
    fecha_inicio_mensualidad: i.fecha_inicio_mensualidad ?? null,
    dia_corte: i.dia_corte ?? null,
    monto_mensualidad: i.monto_mensualidad ?? null,
    monto_inscripcion: i.monto_inscripcion ?? null,
    estado: i.estado ?? 'activo',
    notas: i.notas ?? null,
    created_at: now(),
    updated_at: now(),
  }
  insc.push(nueva)
  write(K.inscripciones, insc)
  return nueva
}

// ---- Vista detalle (join + próxima fecha de corte) -------------------
export function listInscripcionesDetalle(): InscripcionDetalle[] {
  const padres = read<Padre>(K.padres)
  const alumnos = read<Alumno>(K.alumnos)
  const insc = read<Inscripcion>(K.inscripciones)
  return insc
    .map((i) => {
      const a = alumnos.find((x) => x.id === i.alumno_id)
      const p = a ? padres.find((x) => x.id === a.padre_id) : undefined
      if (!a || !p) return null
      const fila: InscripcionDetalle = {
        id: i.id,
        alumno_id: i.alumno_id,
        alumno_nombre: a.nombre,
        alumno_tipo: a.tipo,
        padre_id: p.id,
        padre_nombre: p.nombre,
        padre_telefono: p.telefono,
        padre_email: p.email,
        deporte: i.deporte,
        fecha_clase_muestra: i.fecha_clase_muestra,
        fecha_inscripcion: i.fecha_inscripcion,
        fecha_inicio_mensualidad: i.fecha_inicio_mensualidad,
        dia_corte: i.dia_corte,
        monto_mensualidad: i.monto_mensualidad,
        estado: i.estado,
        proxima_fecha_corte: proximaFechaCorte(i.dia_corte),
      }
      return fila
    })
    .filter((x): x is InscripcionDetalle => x !== null)
    .sort((a, b) => a.deporte.localeCompare(b.deporte))
}

// ---- Datos de ejemplo (solo la primera vez) --------------------------
export function seedSiVacio(): void {
  if (localStorage.getItem(K.seed)) return
  if (read<Padre>(K.padres).length > 0) {
    localStorage.setItem(K.seed, '1')
    return
  }

  const p1 = createPadre({
    nombre: 'Ana López', telefono: '811-111-1111', email: 'ana@example.com',
    tipo: 'externo', fuente: 'Redes sociales', deporte_interes: 'Fútbol', etapa: 'nuevo',
  })
  const p2 = createPadre({
    nombre: 'Jorge Martínez', telefono: '811-222-2222',
    tipo: 'terranova', fuente: 'Alumno actual de Terranova', deporte_interes: 'Taekwondo',
    etapa: 'clase_muestra', nombre_nino: 'Diego Martínez',
    fecha_clase_muestra: proxDias(3),
  })
  createPadre({
    nombre: 'María Ruiz', telefono: '811-333-3333',
    tipo: 'externo', fuente: 'Recomendación', deporte_interes: 'Danza',
    etapa: 'asistio_muestra', nombre_nino: 'Sofía Ruiz', fecha_clase_muestra: proxDias(-2),
  })

  // Un lead ya convertido con alumno + inscripción
  const p4 = createPadre({
    nombre: 'Carlos Gómez', telefono: '811-444-4444',
    tipo: 'terranova', fuente: 'Página web', deporte_interes: 'Voleibol',
    etapa: 'inscrito', nombre_nino: 'Lucía Gómez',
    fecha_clase_muestra: proxDias(-10), fecha_inscripcion: proxDias(-7),
  })
  const a4 = createAlumno({
    padre_id: p4.id, nombre: 'Lucía Gómez', tipo: 'terranova', grado_terranova: '4° B',
  })
  createInscripcion({
    alumno_id: a4.id, deporte: 'Voleibol',
    fecha_clase_muestra: proxDias(-10), fecha_inscripcion: proxDias(-7),
    fecha_inicio_mensualidad: proxDias(-7), dia_corte: new Date().getDate() + 2,
    monto_mensualidad: 800, monto_inscripcion: 500, estado: 'activo',
  })

  void p1
  void p2
  localStorage.setItem(K.seed, '1')
}

function proxDias(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function limpiarDatosLocales(): void {
  localStorage.removeItem(K.padres)
  localStorage.removeItem(K.alumnos)
  localStorage.removeItem(K.inscripciones)
  localStorage.removeItem(K.seed)
}
