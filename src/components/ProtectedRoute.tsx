import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Rol } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Rol[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-akira-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-akira-red border-t-transparent rounded-full animate-spin" />
          <p className="text-akira-muted text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user.rol)) {
    // Redirigir al portal correcto según rol
    if (user.rol === 'alumno') return <Navigate to="/alumno" replace />
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
