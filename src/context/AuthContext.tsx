import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { MODO_LOCAL } from '../lib/data'
import { seedSiVacio } from '../lib/localStore'

export interface Usuario {
  email: string
}

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  modoLocal: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const LOCAL_KEY = 'as_local_user'

const AuthContext = createContext<AuthState>({
  usuario: null,
  cargando: true,
  modoLocal: MODO_LOCAL,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (MODO_LOCAL) {
      seedSiVacio()
      const email = localStorage.getItem(LOCAL_KEY)
      setUsuario(email ? { email } : null)
      setCargando(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session ? { email: data.session.user.email ?? '' } : null)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sesion) => {
      setUsuario(sesion ? { email: sesion.user.email ?? '' } : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (MODO_LOCAL) {
      const correo = email.trim() || 'local@terranova'
      localStorage.setItem(LOCAL_KEY, correo)
      setUsuario({ email: correo })
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (MODO_LOCAL) {
      localStorage.removeItem(LOCAL_KEY)
      setUsuario(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, modoLocal: MODO_LOCAL, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
