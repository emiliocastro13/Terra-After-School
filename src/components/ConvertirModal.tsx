import { useEffect, useState } from 'react'
import { data } from '../lib/data'
import type { Padre, TipoContacto } from '../lib/types'
import { DEPORTES } from '../lib/constants'
import { hoyISO } from '../lib/format'
import { Boton, Campo, inputClass, Modal } from './ui'

// Convierte un lead (papá) en alumno + inscripción a un deporte.
export default function ConvertirModal({
  abierto,
  onClose,
  onConvertido,
  lead,
}: {
  abierto: boolean
  onClose: () => void
  onConvertido: () => void
  lead: Padre | null
}) {
  const [nombreNino, setNombreNino] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [tipo, setTipo] = useState<TipoContacto>('externo')
  const [grado, setGrado] = useState('')
  const [deporte, setDeporte] = useState('')
  const [fechaClaseMuestra, setFechaClaseMuestra] = useState('')
  const [fechaInscripcion, setFechaInscripcion] = useState(hoyISO())
  const [fechaInicioMensualidad, setFechaInicioMensualidad] = useState('')
  const [diaCorte, setDiaCorte] = useState('')
  const [montoMensualidad, setMontoMensualidad] = useState('')
  const [montoInscripcion, setMontoInscripcion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lead) return
    setNombreNino(lead.nombre_nino ?? '')
    setTipo(lead.tipo)
    setDeporte(lead.deporte_interes ?? '')
    setFechaClaseMuestra(lead.fecha_clase_muestra ?? '')
    setFechaInscripcion(lead.fecha_inscripcion ?? hoyISO())
    setFechaNacimiento('')
    setGrado('')
    setFechaInicioMensualidad('')
    setDiaCorte('')
    setMontoMensualidad('')
    setMontoInscripcion('')
    setError(null)
  }, [lead, abierto])

  const convertir = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead) return
    setError(null)
    if (!nombreNino.trim()) {
      setError('Captura el nombre del niño para generar su perfil de alumno.')
      return
    }
    if (!deporte) {
      setError('Selecciona el deporte de la inscripción.')
      return
    }
    setGuardando(true)

    try {
      // 1) Crear el perfil del alumno
      const alumno = await data.createAlumno({
        padre_id: lead.id,
        nombre: nombreNino.trim(),
        fecha_nacimiento: fechaNacimiento || null,
        tipo,
        grado_terranova: grado.trim() || null,
      })

      // 2) Crear la inscripción al deporte
      await data.createInscripcion({
        alumno_id: alumno.id,
        deporte,
        fecha_clase_muestra: fechaClaseMuestra || null,
        fecha_inscripcion: fechaInscripcion || null,
        fecha_inicio_mensualidad: fechaInicioMensualidad || null,
        dia_corte: diaCorte ? Number(diaCorte) : null,
        monto_mensualidad: montoMensualidad ? Number(montoMensualidad) : null,
        monto_inscripcion: montoInscripcion ? Number(montoInscripcion) : null,
        estado: 'activo',
      })

      // 3) Marcar el lead como inscrito
      await data.updatePadre(lead.id, {
        etapa: 'inscrito',
        nombre_nino: nombreNino.trim(),
        fecha_inscripcion: fechaInscripcion || null,
        fecha_clase_muestra: fechaClaseMuestra || null,
      })
    } catch (e) {
      setGuardando(false)
      setError((e as Error).message)
      return
    }

    setGuardando(false)
    onConvertido()
    onClose()
  }

  return (
    <Modal abierto={abierto} onClose={onClose} titulo="Convertir lead → alumno inscrito">
      {lead && (
        <p className="mb-4 rounded-lg bg-terra-50 p-3 text-sm text-terra-800">
          Papá: <strong>{lead.nombre}</strong>. Se generará el perfil del niño y su inscripción.
          Un mismo papá puede tener varios hijos — para otro hijo repite este proceso.
        </p>
      )}
      <form onSubmit={convertir} className="space-y-4">
        <fieldset className="rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Perfil del niño
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Nombre del niño *">
              <input className={inputClass} value={nombreNino} onChange={(e) => setNombreNino(e.target.value)} />
            </Campo>
            <Campo label="Fecha de nacimiento">
              <input type="date" className={inputClass} value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </Campo>
            <Campo label="Clasificación">
              <select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value as TipoContacto)}>
                <option value="externo">Externo (fuera del colegio)</option>
                <option value="terranova">Alumno de Terranova</option>
              </select>
            </Campo>
            <Campo label="Grado / grupo (si es de Terranova)">
              <input className={inputClass} value={grado} onChange={(e) => setGrado(e.target.value)} />
            </Campo>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inscripción y pagos
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Deporte *">
              <select className={inputClass} value={deporte} onChange={(e) => setDeporte(e.target.value)}>
                <option value="">— Selecciona —</option>
                {DEPORTES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Fecha de clase muestra">
              <input type="date" className={inputClass} value={fechaClaseMuestra} onChange={(e) => setFechaClaseMuestra(e.target.value)} />
            </Campo>
            <Campo label="Fecha de inscripción">
              <input type="date" className={inputClass} value={fechaInscripcion} onChange={(e) => setFechaInscripcion(e.target.value)} />
            </Campo>
            <Campo label="Inicio de mensualidad">
              <input type="date" className={inputClass} value={fechaInicioMensualidad} onChange={(e) => setFechaInicioMensualidad(e.target.value)} />
            </Campo>
            <Campo label="Día de corte (1–31)" hint="Día del mes en que se cobra la mensualidad">
              <input type="number" min={1} max={31} className={inputClass} value={diaCorte} onChange={(e) => setDiaCorte(e.target.value)} />
            </Campo>
            <Campo label="Monto mensualidad (MXN)">
              <input type="number" step="0.01" className={inputClass} value={montoMensualidad} onChange={(e) => setMontoMensualidad(e.target.value)} />
            </Campo>
            <Campo label="Monto inscripción (MXN)">
              <input type="number" step="0.01" className={inputClass} value={montoInscripcion} onChange={(e) => setMontoInscripcion(e.target.value)} />
            </Campo>
          </div>
        </fieldset>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Boton tipo="secundario" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? 'Convirtiendo…' : 'Convertir e inscribir'}
          </Boton>
        </div>
      </form>
    </Modal>
  )
}
