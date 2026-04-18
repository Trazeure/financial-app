'use client'
import { useState, FormEvent } from 'react'
import { TrendingUp, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(username.trim(), password)
      if (ok) {
        onSuccess()
      } else {
        setError('Credenciales incorrectas')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-balance rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-serif italic text-3xl text-text-primary mb-1">Finanzas</h1>
          <p className="text-sm text-text-muted">Control financiero personal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Escribe tu usuario"
              autoComplete="username"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-balance/50 focus:border-balance/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full bg-background border border-border rounded px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-balance/50 focus:border-balance/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-expense bg-expense-light border border-expense/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="flex items-center justify-center gap-2 bg-balance text-white rounded py-2.5 text-sm font-medium transition-all duration-200 hover:bg-balance/90 focus:outline-none focus:ring-2 focus:ring-balance/40 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-4">
          Tus datos se guardan en tu propio Google Sheets
        </p>
      </div>
    </div>
  )
}
