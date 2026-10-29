// Tipos del dominio del CRM

export type TipoContacto = 'externo' | 'terranova'

export type EtapaEmbudo =
  | 'nuevo'
  | 'contactado'
  | 'clase_muestra'
  | 'asistio_muestra'
  | 'inscrito'
  | 'perdido'

export type EstadoInscripcion = 'activo' | 'pausado' | 'baja'

export interface Padre {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  tipo: TipoContacto
  fuente: string | null
  deporte_interes: string | null
  etapa: EtapaEmbudo
  nombre_nino: string | null
  fecha_clase_muestra: string | null
  fecha_inscripcion: string | null
  responsable: string | null
  notas: string | null
  motivo_perdida: string | null
  created_at: string
  updated_at: string
}

export interface Alumno {
  id: string
  padre_id: string
  nombre: string
  fecha_nacimiento: string | null
  tipo: TipoContacto
  grado_terranova: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Inscripcion {
  id: string
  alumno_id: string
  deporte: string
  fecha_clase_muestra: string | null
  fecha_inscripcion: string | null
  fecha_inicio_mensualidad: string | null
  dia_corte: number | null
  monto_mensualidad: number | null
  monto_inscripcion: number | null
  estado: EstadoInscripcion
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Deporte {
  id: string
  nombre: string
  activo: boolean
  created_at: string
}

// Fila de la vista v_inscripciones_detalle
export interface InscripcionDetalle {
  id: string
  alumno_id: string
  alumno_nombre: string
  alumno_tipo: TipoContacto
  padre_id: string
  padre_nombre: string
  padre_telefono: string | null
  padre_email: string | null
  deporte: string
  fecha_clase_muestra: string | null
  fecha_inscripcion: string | null
  fecha_inicio_mensualidad: string | null
  dia_corte: number | null
  monto_mensualidad: number | null
  estado: EstadoInscripcion
  proxima_fecha_corte: string | null
}
