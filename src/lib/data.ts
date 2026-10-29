// Capa de datos unificada.
// - Si Supabase está configurado (.env con VITE_SUPABASE_*), usa Supabase.
// - Si no, usa el almacén local del navegador (MODO LOCAL) para desarrollar
//   sin base de datos en la nube. Al conectar Supabase, no cambia nada más.
import { supabase, supabaseConfigurado } from './supabase'
import * as local from './localStore'
import type { Alumno, Inscripcion, InscripcionDetalle, Padre } from './types'

export const MODO_LOCAL = !supabaseConfigurado

export const data = {
  async listPadres(): Promise<Padre[]> {
    if (MODO_LOCAL) return local.listPadres()
    const { data, error } = await supabase
      .from('padres')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data as Padre[]
  },

  async createPadre(p: Partial<Padre>): Promise<void> {
    if (MODO_LOCAL) {
      local.createPadre(p)
      return
    }
    const { error } = await supabase.from('padres').insert(p)
    if (error) throw new Error(error.message)
  },

  async updatePadre(id: string, patch: Partial<Padre>): Promise<void> {
    if (MODO_LOCAL) {
      local.updatePadre(id, patch)
      return
    }
    const { error } = await supabase.from('padres').update(patch).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async createAlumno(a: Partial<Alumno>): Promise<Alumno> {
    if (MODO_LOCAL) return local.createAlumno(a)
    const { data, error } = await supabase.from('alumnos').insert(a).select().single()
    if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el alumno.')
    return data as Alumno
  },

  async createInscripcion(i: Partial<Inscripcion>): Promise<void> {
    if (MODO_LOCAL) {
      local.createInscripcion(i)
      return
    }
    const { error } = await supabase.from('inscripciones').insert(i)
    if (error) throw new Error(error.message)
  },

  async listInscripcionesDetalle(): Promise<InscripcionDetalle[]> {
    if (MODO_LOCAL) return local.listInscripcionesDetalle()
    const { data, error } = await supabase
      .from('v_inscripciones_detalle')
      .select('*')
      .order('deporte', { ascending: true })
    if (error) throw new Error(error.message)
    return data as InscripcionDetalle[]
  },
}

export { limpiarDatosLocales } from './localStore'
