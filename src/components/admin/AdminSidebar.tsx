import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, CreditCard,
  ClipboardList, BarChart3, Sword, LogOut, Menu, X, Settings
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/alumnos', icon: Users, label: 'Alumnos' },
  { to: '/admin/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/admin/pagos', icon: CreditCard, label: 'Pagos' },
  { to: '/admin/asistencia', icon: ClipboardList, label: 'Asistencia' },
  { to: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
]

export function AdminSidebar() {
  const { user, signOut } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-40 bg-akira-dark border-r border-akira-border flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-akira-border shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <Sword className="w-6 h-6 text-akira-red shrink-0" />
              <span className="font-heading text-white tracking-wider text-sm whitespace-nowrap">AKIRA FC</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-akira-darker text-akira-muted hover:text-white transition-colors shrink-0 ml-auto"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group relative',
                  isActive
                    ? 'bg-akira-red/15 text-akira-red border border-akira-red/20'
                    : 'text-akira-muted hover:text-white hover:bg-akira-darker'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
              {/* Tooltip cuando sidebar cerrado */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-akira-darker border border-akira-border rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        {user && (
          <div className="p-3 border-t border-akira-border">
            <div className={cn('flex items-center gap-3 px-2 py-2', !sidebarOpen && 'justify-center')}>
              <Avatar nombre={user.nombre} apellido={user.apellido} foto={user.foto_url} size="sm" />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.nombre} {user.apellido}</p>
                  <p className="text-akira-muted text-xs capitalize">{user.rol}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-akira-muted hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm mt-1',
                !sidebarOpen && 'justify-center'
              )}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {sidebarOpen && 'Cerrar sesión'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
