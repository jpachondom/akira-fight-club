import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sword } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-akira-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-akira-red/10 border border-akira-red/30 mb-4">
            <Sword className="w-8 h-8 text-akira-red" />
          </div>
          <h1 className="font-heading text-3xl text-white tracking-wider">AKIRA FIGHT CLUB</h1>
        </div>

        <div className="card-akira p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400 text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Correo enviado</h2>
              <p className="text-akira-muted text-sm">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Recuperar contraseña</h2>
              <p className="text-akira-muted text-sm mb-6">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-akira-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-akira-darker border border-akira-border rounded-lg px-3 py-2.5 text-white placeholder-akira-muted/50 focus:outline-none focus:border-akira-red transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-akira-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
