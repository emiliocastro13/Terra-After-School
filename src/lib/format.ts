// Utilidades de formato

export function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  // iso puede ser 'YYYY-MM-DD'
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  if (!y || !m || !d) return '—'
  const fecha = new Date(y, m - 1, d)
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtMoneda(valor: number | null | undefined): string {
  if (valor == null) return '—'
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export function diasHasta(iso: string | null | undefined): number | null {
  if (!iso) return null
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  if (!y || !m || !d) return null
  const objetivo = new Date(y, m - 1, d)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const diff = objetivo.getTime() - hoy.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function hoyISO(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// Réplica en JS del cálculo de la vista v_inscripciones_detalle:
// próxima fecha de corte a partir del día de corte (1-31).
export function proximaFechaCorte(diaCorte: number | null | undefined): string | null {
  if (diaCorte == null) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const dia = hoy.getDate()
  const ultimoDia = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

  let y = hoy.getFullYear()
  let m = hoy.getMonth() // 0-based
  if (diaCorte < dia) {
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }
  const d = Math.min(diaCorte, ultimoDia(y, m))
  const mm = String(m + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}
