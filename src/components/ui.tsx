import type { ReactNode } from 'react'

export function Modal({
  abierto,
  onClose,
  titulo,
  children,
  ancho = 'max-w-2xl',
}: {
  abierto: boolean
  onClose: () => void
  titulo: string
  children: ReactNode
  ancho?: string
}) {
  if (!abierto) return null
  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className={`w-full ${ancho} rounded-xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function Campo({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500'

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  )
}

export function Boton({
  children,
  onClick,
  tipo = 'primario',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  tipo?: 'primario' | 'secundario' | 'peligro'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const estilos = {
    primario: 'bg-terra-600 text-white hover:bg-terra-700 disabled:bg-terra-300',
    secundario: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    peligro: 'bg-rose-600 text-white hover:bg-rose-700',
  }[tipo]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${estilos} ${className}`}
    >
      {children}
    </button>
  )
}
