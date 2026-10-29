import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { InscripcionDetalle } from '../lib/types'
import { DEPORTES, ESTADOS_INSCRIPCION } from '../lib/constants'
import { diasHasta, fmtFecha, fmtMoneda } from '../lib/format'
import { Badge } from '../components/ui'

export default function Alumnos() {
  const [filas, setFilas] = useState<InscripcionDetalle[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('activo')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    ;(async () => {
      setCargando(true)
      const { data, error } = await supabase
        .from('v_inscripciones_detalle')
        .select('*')
        .order('deporte', { ascending: true })
      if (error) setError(error.message)
      else setFilas(data as InscripcionDetalle[])
      setCargando(false)
    })()
  }, [])

  const filtradas = useMemo(() => {
    return filas.filter((f) => {
      if (filtroDeporte && f.deporte !== filtroDeporte) return false
      if (filtroEstado && f.estado !== filtroEstado) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const campos = [f.alumno_nombre, f.padre_nombre, f.padre_telefono].filter(Boolean).join(' ').toLowerCase()
        if (!campos.includes(q)) return false
      }
      return true
    })
  }, [filas, filtroDeporte, filtroEstado, busqueda])

  const estadoBadge = (estado: string) => {
    const e = ESTADOS_INSCRIPCION.find((x) => x.valor === estado)
    return <Badge className={`${e?.color ?? ''} border-transparent`}>{e?.label ?? estado}</Badge>
  }

  const corteBadge = (iso: string | null) => {
    if (!iso) return <span className="text-slate-300">—</span>
    const d = diasHasta(iso)
    let color = 'text-slate-600'
    if (d !== null && d <= 3) color = 'text-rose-600 font-semibold'
    else if (d !== null && d <= 7) color = 'text-amber-600 font-medium'
    return (
      <span className={color}>
        {fmtFecha(iso)}
        {d !== null && (
          <span className="ml-1 text-xs text-slate-400">
            ({d < 0 ? `hace ${-d}d` : d === 0 ? 'hoy' : `en ${d}d`})
          </span>
        )}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Alumnos inscritos</h1>
        <p className="text-sm text-slate-400">
          Niños inscritos por deporte con sus fechas de corte. Los maestros pueden filtrar su deporte.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          placeholder="Buscar alumno, papá, teléfono…"
          className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-terra-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" value={filtroDeporte} onChange={(e) => setFiltroDeporte(e.target.value)}>
          <option value="">Todos los deportes</option>
          {DEPORTES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_INSCRIPCION.map((e) => (
            <option key={e.valor} value={e.valor}>{e.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

      {cargando ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : filtradas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          Aún no hay alumnos inscritos con estos filtros. Convierte leads desde el Embudo.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Deporte</th>
                <th className="px-4 py-3">Papá / tutor</th>
                <th className="px-4 py-3">Inscripción</th>
                <th className="px-4 py-3">Día corte</th>
                <th className="px-4 py-3">Próximo corte</th>
                <th className="px-4 py-3">Mensualidad</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{f.alumno_nombre}</div>
                    <div className="text-xs text-slate-400">
                      {f.alumno_tipo === 'terranova' ? 'Terranova' : 'Externo'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{f.deporte}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{f.padre_nombre}</div>
                    {f.padre_telefono && <div className="text-xs text-slate-400">{f.padre_telefono}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtFecha(f.fecha_inscripcion)}</td>
                  <td className="px-4 py-3 text-slate-600">{f.dia_corte ?? '—'}</td>
                  <td className="px-4 py-3">{corteBadge(f.proxima_fecha_corte)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtMoneda(f.monto_mensualidad)}</td>
                  <td className="px-4 py-3">{estadoBadge(f.estado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
