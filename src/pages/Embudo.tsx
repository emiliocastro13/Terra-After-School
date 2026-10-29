import { useEffect, useMemo, useState } from 'react'
import { data } from '../lib/data'
import type { EtapaEmbudo, Padre } from '../lib/types'
import { DEPORTES, ETAPAS, etapaColor, tipoLabel } from '../lib/constants'
import { fmtFecha } from '../lib/format'
import { Badge, Boton } from '../components/ui'
import LeadModal from '../components/LeadModal'
import ConvertirModal from '../components/ConvertirModal'

export default function Embudo() {
  const [padres, setPadres] = useState<Padre[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [leadEdit, setLeadEdit] = useState<Padre | null>(null)
  const [convertirAbierto, setConvertirAbierto] = useState(false)
  const [leadConvertir, setLeadConvertir] = useState<Padre | null>(null)

  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    setCargando(true)
    try {
      setPadres(await data.listPadres())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    return padres.filter((p) => {
      if (filtroDeporte && p.deporte_interes !== filtroDeporte) return false
      if (filtroTipo && p.tipo !== filtroTipo) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const campos = [p.nombre, p.telefono, p.email, p.nombre_nino].filter(Boolean).join(' ').toLowerCase()
        if (!campos.includes(q)) return false
      }
      return true
    })
  }, [padres, filtroDeporte, filtroTipo, busqueda])

  const porEtapa = (etapa: EtapaEmbudo) => filtrados.filter((p) => p.etapa === etapa)

  const moverEtapa = async (p: Padre, etapa: EtapaEmbudo) => {
    setPadres((prev) => prev.map((x) => (x.id === p.id ? { ...x, etapa } : x)))
    await data.updatePadre(p.id, { etapa })
  }

  const nuevoLead = () => {
    setLeadEdit(null)
    setModalAbierto(true)
  }
  const editar = (p: Padre) => {
    setLeadEdit(p)
    setModalAbierto(true)
  }
  const convertir = (p: Padre) => {
    setLeadConvertir(p)
    setConvertirAbierto(true)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Embudo de ventas</h1>
          <p className="text-sm text-slate-400">
            El papá es el lead. Arrástralo por el embudo hasta convertirlo en alumno inscrito.
          </p>
        </div>
        <Boton onClick={nuevoLead}>+ Nuevo lead</Boton>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          placeholder="Buscar por papá, niño, teléfono…"
          className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-terra-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          value={filtroDeporte}
          onChange={(e) => setFiltroDeporte(e.target.value)}
        >
          <option value="">Todos los deportes</option>
          {DEPORTES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Externos y Terranova</option>
          <option value="externo">Solo externos</option>
          <option value="terranova">Solo Terranova</option>
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
      {cargando ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : (
        <div className="kanban-scroll flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.map((et) => {
            const items = porEtapa(et.valor)
            return (
              <div key={et.valor} className="w-72 flex-shrink-0">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">{et.label}</h2>
                  <span className="rounded-full bg-slate-200 px-2 text-xs text-slate-600">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((p) => (
                    <LeadCard
                      key={p.id}
                      padre={p}
                      onEditar={() => editar(p)}
                      onMover={(etapa) => moverEtapa(p, etapa)}
                      onConvertir={() => convertir(p)}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-300">
                      Sin leads
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <LeadModal
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardado={cargar}
        lead={leadEdit}
      />
      <ConvertirModal
        abierto={convertirAbierto}
        onClose={() => setConvertirAbierto(false)}
        onConvertido={cargar}
        lead={leadConvertir}
      />
    </div>
  )
}

function LeadCard({
  padre,
  onEditar,
  onMover,
  onConvertir,
}: {
  padre: Padre
  onEditar: () => void
  onMover: (etapa: EtapaEmbudo) => void
  onConvertir: () => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onEditar} className="text-left">
          <div className="text-sm font-semibold text-slate-800 hover:text-terra-700">
            {padre.nombre}
          </div>
          {padre.nombre_nino && (
            <div className="text-xs text-slate-400">Niño: {padre.nombre_nino}</div>
          )}
        </button>
        <Badge className={padre.tipo === 'terranova' ? 'bg-terra-50 text-terra-700 border-terra-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
          {padre.tipo === 'terranova' ? 'Terranova' : 'Externo'}
        </Badge>
      </div>

      <div className="mt-2 space-y-0.5 text-xs text-slate-500">
        {padre.deporte_interes && <div>🏅 {padre.deporte_interes}</div>}
        {padre.telefono && <div>📞 {padre.telefono}</div>}
        {padre.fecha_clase_muestra && <div>🗓️ Muestra: {fmtFecha(padre.fecha_clase_muestra)}</div>}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <select
          className="flex-1 rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-600"
          value={padre.etapa}
          onChange={(e) => onMover(e.target.value as EtapaEmbudo)}
          title="Cambiar etapa"
        >
          {ETAPAS.map((et) => (
            <option key={et.valor} value={et.valor}>{et.label}</option>
          ))}
        </select>
        {padre.etapa !== 'inscrito' && padre.etapa !== 'perdido' && (
          <button
            onClick={onConvertir}
            className="rounded bg-terra-600 px-2 py-1 text-xs font-medium text-white hover:bg-terra-700"
            title="Convertir a alumno inscrito"
          >
            Convertir
          </button>
        )}
      </div>
      {padre.etapa === 'inscrito' && (
        <div className={`mt-2 rounded px-2 py-0.5 text-center text-xs ${etapaColor('inscrito')}`}>
          ✓ Convertido · ver en Alumnos
        </div>
      )}
      {padre.etapa === 'perdido' && padre.motivo_perdida && (
        <div className="mt-2 text-xs text-rose-500">Motivo: {padre.motivo_perdida}</div>
      )}
      <span className="sr-only">{tipoLabel(padre.tipo)}</span>
    </div>
  )
}
