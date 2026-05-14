import { Menu, Bell } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

export function AdminHeader() {
  const { setSidebarOpen, sidebarOpen } = useUIStore()
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-akira-dark border-b border-akira-border flex items-center justify-between px-4 md:px-6 shrink-0">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-akira-darker text-akira-muted hover:text-white transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-akira-darker text-akira-muted hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.nombre} {user.apellido}</p>
            <p className="text-xs text-akira-muted capitalize">{user.rol}</p>
          </div>
        )}
      </div>
    </header>
  )
}
