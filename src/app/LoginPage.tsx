import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Sword } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/schemas'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, user } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  // Redirigir si ya está autenticado
  if (user) {
    if (user.rol === 'alumno') navigate('/alumno')
    else navigate('/admin')
  }

  const onSubmit = async (data: LoginInput) => {
    setError('')
    try {
      await signIn(data.email, data.password)
      const updatedUser = useAuthStore.getState().user
      if (updatedUser?.rol === 'alumno') navigate('/alumno')
      else navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-akira-black flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-akira-red/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-akira-red/10 border border-akira-red/30 mb-4">
            <Sword className="w-8 h-8 text-akira-red" />
          </div>
          <h1 className="font-heading text-3xl text-white tracking-wider">AKIRA FIGHT CLUB</h1>
          <p className="text-akira-muted text-sm mt-1">Sistema de gestión</p>
        </div>

        {/* Card de login */}
        <div className="card-akira p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-akira-muted mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full bg-akira-darker border border-akira-border rounded-lg px-3 py-2.5 text-white placeholder-akira-muted/50 focus:outline-none focus:border-akira-red transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-akira-muted mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-akira-darker border border-akira-border rounded-lg px-3 py-2.5 pr-10 text-white placeholder-akira-muted/50 focus:outline-none focus:border-akira-red transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-akira-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/recuperar-password"
              className="text-sm text-akira-muted hover:text-akira-red transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <p className="text-center text-akira-muted text-xs mt-6">
          El registro de nuevos alumnos se realiza a través del administrador.
        </p>
      </div>
    </div>
  )
}
