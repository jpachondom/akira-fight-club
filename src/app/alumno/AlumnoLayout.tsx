import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, CreditCard, Clock, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/alumno/inicio', icon: Home, label: 'Inicio' },
  { to: '/alumno/clases', icon: Calendar, label: 'Clases' },
  { to: '/alumno/plan', icon: CreditCard, label: 'Mi plan' },
  { to: '/alumno/historial', icon: Clock, label: 'Historial' },
  { to: '/alumno/perfil', icon: User, label: 'Perfil' },
]

export function AlumnoLayout() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-akira-black flex flex-col">
      {/* Header */}
      <header className="bg-akira-dark border-b border-akira-border h-14 flex items-center justify-between px-4 shrink-0">
        <span className="font-display text-xl text-white tracking-widest">AKIRA FC</span>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg text-akira-muted hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-auto pb-20">
        <div className="page-enter p-4 max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Nav inferior (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-akira-dark border-t border-akira-border safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                  isActive ? 'text-akira-red' : 'text-akira-muted hover:text-white'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
