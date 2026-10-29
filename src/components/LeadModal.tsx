import { useEffect, useState } from 'react'
import { data } from '../lib/data'
import type { EtapaEmbudo, Padre, TipoContacto } from '../lib/types'
import { DEPORTES, ETAPAS, FUENTES, TIPOS } from '../lib/constants'
import { Boton, Campo, inputClass, Modal } from './ui'

type Borrador = {
  nombre: string
  telefono: string
  email: string
  tipo: TipoContacto
  fuente: string
  deporte_interes: string
  etapa: EtapaEmbudo
  nombre_nino: string
  fecha_clase_muestra: string
  responsable: string
  notas: string
  motivo_perdida: string
}

const vacio: Borrador = {
  nombre: '',
  telefono: '',
  email: '',
  tipo: 'externo',
  fuente: '',
  deporte_interes: '',
  etapa: 'nuevo',
  nombre_nino: '',
  fecha_clase_muestra: '',
  responsable: '',
  notas: '',
  motivo_perdida: '',
}

export default function LeadModal({
  abierto,
  onClose,
  onGuardado,
  lead,
}: {
  abierto: boolean
  onClose: () => void
  onGuardado: () => void
  lead: Padre | null
}) {
  const [b, setB] = useState<Borrador>(vacio)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lead) {
      setB({
        nombre: lead.nombre ?? '',
        telefono: lead.telefono ?? '',
        email: lead.email ?? '',
        tipo: lead.tipo,
        fuente: lead.fuente ?? '',
        deporte_interes: lead.deporte_interes ?? '',
        etapa: lead.etapa,
        nombre_nino: lead.nombre_nino ?? '',
        fecha_clase_muestra: lead.fecha_clase_muestra ?? '',
        responsable: lead.responsable ?? '',
        notas: lead.notas ?? '',
        motivo_perdida: lead.motivo_perdida ?? '',
      })
    } else {
      setB(vacio)
    }
    setError(null)
  }, [lead, abierto])

  const set = <K extends keyof Borrador>(k: K, v: Borrador[K]) =>
    setB((prev) => ({ ...prev, [k]: v }))

  // ¿se necesita el nombre del niño? a partir de clase muestra
  const necesitaNino = ['clase_muestra', 'asistio_muestra', 'inscrito'].includes(b.etapa)

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!b.nombre.trim()) {
      setError('El nombre del papá/tutor es obligatorio.')
      return
    }
    setGuardando(true)
    const payload = {
      nombre: b.nombre.trim(),
      telefono: b.telefono.trim() || null,
      email: b.email.trim() || null,
      tipo: b.tipo,
      fuente: b.fuente || null,
      deporte_interes: b.deporte_interes || null,
      etapa: b.etapa,
      nombre_nino: b.nombre_nino.trim() || null,
      fecha_clase_muestra: b.fecha_clase_muestra || null,
      responsable: b.responsable.trim() || null,
      notas: b.notas.trim() || null,
      motivo_perdida: b.etapa === 'perdido' ? b.motivo_perdida.trim() || null : null,
    }

    try {
      if (lead) await data.updatePadre(lead.id, payload)
      else await data.createPadre(payload)
    } catch (e) {
      setGuardando(false)
      setError((e as Error).message)
      return
    }
    setGuardando(false)
    onGuardado()
    onClose()
  }

  return (
    <Modal abierto={abierto} onClose={onClose} titulo={lead ? 'Editar lead' : 'Nuevo lead (papá)'}>
      <form onSubmit={guardar} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="Nombre del papá / tutor *">
            <input className={inputClass} value={b.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </Campo>
          <Campo label="Teléfono">
            <input className={inputClass} value={b.telefono} onChange={(e) => set('telefono', e.target.value)} />
          </Campo>
          <Campo label="Correo">
            <input type="email" className={inputClass} value={b.email} onChange={(e) => set('email', e.target.value)} />
          </Campo>
          <Campo label="Clasificación">
            <select className={inputClass} value={b.tipo} onChange={(e) => set('tipo', e.target.value as TipoContacto)}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Deporte de interés">
            <select className={inputClass} value={b.deporte_interes} onChange={(e) => set('deporte_interes', e.target.value)}>
              <option value="">— Selecciona —</option>
              {DEPORTES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Campo>
          <Campo label="¿Cómo se enteró?">
            <select className={inputClass} value={b.fuente} onChange={(e) => set('fuente', e.target.value)}>
              <option value="">— Selecciona —</option>
              {FUENTES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Etapa del embudo">
            <select className={inputClass} value={b.etapa} onChange={(e) => set('etapa', e.target.value as EtapaEmbudo)}>
              {ETAPAS.map((et) => (
                <option key={et.valor} value={et.valor}>{et.label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Responsable del seguimiento">
            <input className={inputClass} value={b.responsable} onChange={(e) => set('responsable', e.target.value)} />
          </Campo>
          <Campo
            label={`Nombre del niño${necesitaNino ? ' *' : ''}`}
            hint={necesitaNino ? 'Necesario a partir de la clase muestra' : 'Opcional en etapa de lead'}
          >
            <input className={inputClass} value={b.nombre_nino} onChange={(e) => set('nombre_nino', e.target.value)} />
          </Campo>
          <Campo label="Fecha de clase muestra">
            <input type="date" className={inputClass} value={b.fecha_clase_muestra} onChange={(e) => set('fecha_clase_muestra', e.target.value)} />
          </Campo>
        </div>

        {b.etapa === 'perdido' && (
          <Campo label="Motivo de pérdida">
            <input className={inputClass} value={b.motivo_perdida} onChange={(e) => set('motivo_perdida', e.target.value)} />
          </Campo>
        )}

        <Campo label="Notas">
          <textarea className={inputClass} rows={3} value={b.notas} onChange={(e) => set('notas', e.target.value)} />
        </Campo>

        {necesitaNino && !b.nombre_nino.trim() && (
          <p className="text-xs text-amber-600">
            Sugerencia: en esta etapa conviene capturar el nombre del niño.
          </p>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Boton tipo="secundario" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</Boton>
        </div>
      </form>
    </Modal>
  )
}
