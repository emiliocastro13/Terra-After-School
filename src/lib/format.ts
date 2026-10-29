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
