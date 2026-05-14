import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/Toaster'

// Auth
import { LoginPage } from '@/app/LoginPage'
import { RecuperarPassword } from '@/app/RecuperarPassword'

// Admin
import { AdminLayout } from '@/app/admin/AdminLayout'
import { AdminDashboard } from '@/app/admin/dashboard/AdminDashboard'
import { AdminAlumnos } from '@/app/admin/alumnos/AdminAlumnos'
import { AdminAlumnoDetalle } from '@/app/admin/alumnos/AdminAlumnoDetalle'
import { AdminAgenda } from '@/app/admin/agenda/AdminAgenda'
import { AdminPagos } from '@/app/admin/pagos/AdminPagos'
import { AdminAsistencia } from '@/app/admin/asistencia/AdminAsistencia'
import { AdminReportes } from '@/app/admin/reportes/AdminReportes'
import { AdminConfiguracion } from '@/app/admin/configuracion/AdminConfiguracion'

// Alumno
import { AlumnoLayout } from '@/app/alumno/AlumnoLayout'
import { AlumnoInicio } from '@/app/alumno/inicio/AlumnoInicio'
import { AlumnoClases } from '@/app/alumno/clases/AlumnoClases'
import { AlumnoPlan } from '@/app/alumno/plan/AlumnoPlan'
import { AlumnoHistorial } from '@/app/alumno/historial/AlumnoHistorial'
import { AlumnoPerfil } from '@/app/alumno/perfil/AlumnoPerfil'

export default function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
          .catch(console.error)
          .finally(() => setLoading(false))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id).catch(console.error)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, setUser, setLoading])

  return (
    <>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'instructor']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="alumnos" element={<AdminAlumnos />} />
          <Route path="alumnos/:id" element={<AdminAlumnoDetalle />} />
          <Route path="agenda" element={<AdminAgenda />} />
          <Route path="pagos" element={<AdminPagos />} />
          <Route path="asistencia" element={<AdminAsistencia />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>

        {/* Alumno */}
        <Route
          path="/alumno"
          element={
            <ProtectedRoute allowedRoles={['alumno']}>
              <AlumnoLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<AlumnoInicio />} />
          <Route path="clases" element={<AlumnoClases />} />
          <Route path="plan" element={<AlumnoPlan />} />
          <Route path="historial" element={<AlumnoHistorial />} />
          <Route path="perfil" element={<AlumnoPerfil />} />
        </Route>

        {/* Raíz → redirigir según rol */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster />
    </>
  )
}
