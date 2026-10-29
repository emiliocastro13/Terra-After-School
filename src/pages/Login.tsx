import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Boton, Campo, inputClass } from '../components/ui'

export default function Login() {
  const { signIn, modoLocal } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const { error } = await signIn(email, password)
    setCargando(false)
    if (error) setError(error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-terra-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-terra-600 text-lg font-bold text-white">
            TA
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Terra After School</h1>
          <p className="text-sm text-slate-400">CRM de extracurriculares</p>
        </div>

        {modoLocal && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            <strong>Modo local</strong>: los datos se guardan en este navegador (sin Supabase).
            Entra con cualquier correo para empezar a construir y probar.
          </div>
        )}

        <form onSubmit={entrar} className="space-y-4">
          <Campo label="Correo">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!modoLocal}
              autoComplete="email"
              placeholder={modoLocal ? 'tu@correo.com (cualquiera)' : ''}
            />
          </Campo>
          {!modoLocal && (
            <Campo label="Contraseña">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Campo>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Boton type="submit" disabled={cargando} className="w-full">
            {cargando ? 'Entrando…' : modoLocal ? 'Entrar (modo local)' : 'Entrar'}
          </Boton>
        </form>

        {!modoLocal && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Los usuarios se crean desde el panel de Supabase (Authentication → Users).
          </p>
        )}
      </div>
    </div>
  )
}
