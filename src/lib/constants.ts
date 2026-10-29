import type { EtapaEmbudo, EstadoInscripcion, TipoContacto } from './types'

export const DEPORTES = ['Fútbol', 'Taekwondo', 'Danza', 'Voleibol'] as const

export const ETAPAS: { valor: EtapaEmbudo; label: string; color: string }[] = [
  { valor: 'nuevo', label: 'Nuevo', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { valor: 'contactado', label: 'Contactado', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { valor: 'clase_muestra', label: 'Clase muestra agendada', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { valor: 'asistio_muestra', label: 'Asistió a clase muestra', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { valor: 'inscrito', label: 'Inscrito', color: 'bg-terra-100 text-terra-700 border-terra-300' },
  { valor: 'perdido', label: 'Perdido', color: 'bg-rose-100 text-rose-700 border-rose-300' },
]

// Etapas que forman el embudo activo (sin "perdido", que es un estado final aparte)
export const ETAPAS_EMBUDO = ETAPAS.filter((e) => e.valor !== 'perdido')

export function etapaLabel(valor: EtapaEmbudo): string {
  return ETAPAS.find((e) => e.valor === valor)?.label ?? valor
}

export function etapaColor(valor: EtapaEmbudo): string {
  return ETAPAS.find((e) => e.valor === valor)?.color ?? 'bg-slate-100 text-slate-700 border-slate-300'
}

export const TIPOS: { valor: TipoContacto; label: string }[] = [
  { valor: 'externo', label: 'Externo (fuera del colegio)' },
  { valor: 'terranova', label: 'Alumno de Terranova' },
]

export function tipoLabel(valor: TipoContacto): string {
  return TIPOS.find((t) => t.valor === valor)?.label ?? valor
}

export const ESTADOS_INSCRIPCION: { valor: EstadoInscripcion; label: string; color: string }[] = [
  { valor: 'activo', label: 'Activo', color: 'bg-terra-100 text-terra-700' },
  { valor: 'pausado', label: 'Pausado', color: 'bg-amber-100 text-amber-800' },
  { valor: 'baja', label: 'Baja', color: 'bg-rose-100 text-rose-700' },
]

export const FUENTES = [
  'Recomendación',
  'Redes sociales',
  'Volante / cartel',
  'Página web',
  'Alumno actual de Terranova',
  'Evento / torneo',
  'Otro',
]
