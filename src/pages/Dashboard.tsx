import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { EtapaEmbudo, InscripcionDetalle, Padre } from '../lib/types'
import { DEPORTES, ETAPAS } from '../lib/constants'
import { diasHasta, fmtFecha } from '../lib/format'

export default function Dashboard() {
  const [padres, setPadres] = useState<Padre[]>([])
  const [inscripciones, setInscripciones] = useState<InscripcionDetalle[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [p, i] = await Promise.all([
        supabase.from('padres').select('*'),
        supabase.from('v_inscripciones_detalle').select('*'),
      ])
      if (p.data) setPadres(p.data as Padre[])
      if (i.data) setInscripciones(i.data as InscripcionDetalle[])
      setCargando(false)
    })()
  }, [])

  const cuentaEtapa = (e: EtapaEmbudo) => padres.filter((p) => p.etapa === e).length
  const activas = inscripciones.filter((i) => i.estado === 'activo')

  // leads activos (no perdidos ni inscritos todavía)
  const leadsActivos = padres.filter((p) => p.etapa !== 'perdido' && p.etapa !== 'inscrito').length
  const convertidos = cuentaEtapa('inscrito')
  const totalNoPerdidos = padres.filter((p) => p.etapa !== 'perdido').length
  const tasaConversion = totalNoPerdidos > 0 ? Math.round((convertidos / totalNoPerdidos) * 100) : 0

  // próximos cortes (7 días)
  const proximosCortes = activas
    .filter((i) => {
      const d = diasHasta(i.proxima_fecha_corte)
      return d !== null && d >= 0 && d <= 7
    })
    .sort((a, b) => (a.proxima_fecha_corte ?? '').localeCompare(b.proxima_fecha_corte ?? ''))

  if (cargando) return <p className="text-sm text-slate-400">Cargando…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Panel general</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tarjeta titulo="Leads activos" valor={leadsActivos} nota="Papás en seguimiento" />
        <Tarjeta titulo="Alumnos inscritos" valor={convertidos} nota="Leads convertidos" acento />
        <Tarjeta titulo="Inscripciones activas" valor={activas.length} nota="Niño × deporte" />
        <Tarjeta titulo="Tasa de conversión" valor={`${tasaConversion}%`} nota="Inscritos / total" />
      </div>

      {/* Embudo */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Embudo de ventas</h2>
          <Link to="/embudo" className="text-sm text-terra-600 hover:underline">Ver embudo →</Link>
        </div>
        <div className="space-y-2">
          {ETAPAS.map((et) => {
            const n = cuentaEtapa(et.valor)
            const max = Math.max(1, ...ETAPAS.map((e) => cuentaEtapa(e.valor)))
            return (
              <div key={et.valor} className="flex items-center gap-3">
                <div className="w-44 text-sm text-slate-600">{et.label}</div>
                <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                  <div
                    className="flex h-6 items-center justify-end rounded bg-terra-400 px-2 text-xs font-medium text-white"
                    style={{ width: `${(n / max) * 100}%`, minWidth: n > 0 ? '1.5rem' : 0 }}
                  >
                    {n > 0 ? n : ''}
                  </div>
                </div>
                <div className="w-8 text-right text-sm text-slate-500">{n}</div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inscritos por deporte */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-800">Inscritos por deporte</h2>
          <div className="space-y-2">
            {DEPORTES.map((d) => {
              const n = activas.filter((i) => i.deporte === d).length
              return (
                <div key={d} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{d}</span>
                  <span className="rounded-full bg-terra-100 px-2.5 py-0.5 text-sm font-semibold text-terra-700">
                    {n}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Próximos cortes */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Próximos cortes (7 días)</h2>
            <Link to="/alumnos" className="text-sm text-terra-600 hover:underline">Ver alumnos →</Link>
          </div>
          {proximosCortes.length === 0 ? (
            <p className="text-sm text-slate-400">Sin cortes en los próximos 7 días.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {proximosCortes.map((i) => {
                const d = diasHasta(i.proxima_fecha_corte)
                return (
                  <li key={i.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{i.alumno_nombre}</div>
                      <div className="text-xs text-slate-400">{i.deporte} · {i.padre_nombre}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className={d !== null && d <= 3 ? 'font-semibold text-rose-600' : 'text-slate-600'}>
                        {fmtFecha(i.proxima_fecha_corte)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {d === 0 ? 'hoy' : `en ${d}d`}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Tarjeta({
  titulo,
  valor,
  nota,
  acento,
}: {
  titulo: string
  valor: number | string
  nota?: string
  acento?: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 ${acento ? 'border-terra-200 bg-terra-50' : 'border-slate-200 bg-white'}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{titulo}</div>
      <div className={`mt-1 text-3xl font-bold ${acento ? 'text-terra-700' : 'text-slate-800'}`}>{valor}</div>
      {nota && <div className="mt-0.5 text-xs text-slate-400">{nota}</div>}
    </div>
  )
}
